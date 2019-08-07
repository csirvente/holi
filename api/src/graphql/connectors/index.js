import _ from 'lodash';
import uuidv4 from 'uuid/v4';

// This fist connector works differently than the rest.
// It does not get Nodes, but data records that can be from a calculation.
// Because of this, it does not assign a __label propery.
function runQueryAndGetRawData(session, query, params) {
  return session.run(query, params)
    .then((result) => {
      session.close();
      if (!result.records) return null;
      return result.records[0].toObject();
    });
}

function runQueryAndGetRecords(session, query, params) {
  return session.run(query, params)
    .then((result) => {
      session.close();
      if (!result.records) return null;
      return result.records.map((r) => {
        const { properties, labels } = r.get(0);
        return Object.assign({}, properties, { __label: labels[0] });
      });
    });
}

function runQueryAndGetRecord(session, query, params) {
  return runQueryAndGetRecords(session, query, params)
    .then((records) => {
      if (!records || records.length !== 1) return null;
      return records[0];
    });
}

function runQueryAndGetRecordsWithFields(session, query, params) {
  return session.run(query, params)
    .then((result) => {
      session.close();
      if (!result.records) return null;
      return result.records.map((r) => {
        const pairs = r.keys.map((key) => {
          const { properties, labels } = r.get(key);
          return [key, Object.assign({}, properties, { __label: labels[0] })];
        });
        return _.fromPairs(pairs);
      });
    });
}

function runQueryAndGetRecordWithFields(session, query, params) {
  return runQueryAndGetRecordsWithFields(session, query, params)
    .then((records) => {
      if (!records || records.length !== 1) return null;
      return records[0];
    });
}

export function findNodesByLabel(driver, label) {
  const query = `
    MATCH (n:${label})
    WHERE NOT EXISTS(n.deleted)
    RETURN n ORDER BY n.created DESC
  `;
  return runQueryAndGetRecords(driver.session(), query, { label });
}

export function findNodeByLabelAndId(driver, label, nodeId) {
  const query = `
    MATCH (n:${label} {nodeId: {nodeId}})
    WHERE NOT EXISTS(n.deleted)
    RETURN n
  `;
  return runQueryAndGetRecord(driver.session(), query, { nodeId });
}

export function findNodeByLabelAndProperty(driver, label, propertyKey, propertyValue) {
  const query = `
    MATCH (n:${label} {${propertyKey}: {value}})
    WHERE NOT EXISTS(n.deleted)
    RETURN n
  `;
  return runQueryAndGetRecord(driver.session(), query, { value: propertyValue });
}

function getRelationshipQuery(relationship, label, direction) {
  const relationshipFragment =
    direction && direction.toUpperCase() === 'IN'
      ? `<-[:${relationship.toUpperCase()}]-`
      : `-[:${relationship.toUpperCase()}]->`;
  const labelFragment =
    label === ''
      ? '(n)'
      : `(n:${label})`;
  const query = `
    MATCH ({nodeId: {nodeId}})${relationshipFragment}${labelFragment}
    WHERE NOT EXISTS(n.deleted)
    RETURN n ORDER BY n.created DESC`;
  return query;
}

export function findNodesByRelationshipAndLabel(
  driver,
  originNodeId,
  relationship,
  label,
  direction,
) {
  const query = getRelationshipQuery(relationship, label, direction);
  return runQueryAndGetRecords(driver.session(), query, { nodeId: originNodeId });
}

export function findNodeByRelationshipAndLabel(
  driver,
  originNodeId,
  relationship,
  label,
  direction,
) {
  const query = getRelationshipQuery(relationship, label, direction);
  return runQueryAndGetRecord(driver.session(), query, { nodeId: originNodeId });
}

export function createTag(driver, { title }, userEmail) {
  const queryParams = {
    title,
    email: userEmail,
    tagId: uuidv4(),
  };
  // Use cypher FOREACH hack to only set nodeId for person if it isn't already set
  const query = `
    MATCH (person:Person {email:{email}})
    CREATE (tag:Tag {title:{title}, nodeId:{tagId}, created:timestamp()})
    CREATE (person)-[:OWNS]->(tag)
    RETURN tag
  `;
  return runQueryAndGetRecord(driver.session(), query, queryParams);
}

export function addGraphTagIsLinked(driver, { from, to }) {
  const queryParams = {
    graphTagId: from.nodeId,
    contentUrl: to.url,
    contentTitle: to.title,
    contentId: uuidv4(),
  };
  // Use cypher FOREACH hack to only set nodeId for content if it isn't already set
  const query = `
    MATCH (graphTag {nodeId: {graphTagId}})
    WITH graphTag
    MERGE (content:Content {url: {contentUrl}, title: {contentTitle}})
    FOREACH (doThis IN CASE WHEN not(exists(content.nodeId)) THEN [1] ELSE [] END |
      SET content += {nodeId:{contentId}, created:timestamp()})
    WITH graphTag, content
    MERGE (graphTag)-[:IS_LINKED]->(content)
    RETURN graphTag as from, content as to
  `;
  return runQueryAndGetRecordWithFields(driver.session(), query, queryParams);
}

export function createContent(driver, { title }, contentUrl) {
  const queryParams = {
    title,
    url: contentUrl,
    contentId: uuidv4(),
  };
  // Use cypher FOREACH hack to only set nodeId for content if it isn't already set
  const query = `
    MERGE (content:Content {url: {url}, title: {title}})
    FOREACH (doThis IN CASE WHEN not(exists(content.nodeId)) THEN [1] ELSE [] END |
      SET content += {nodeId:{contentId}, created:timestamp(), title: {title}})
    SET content.title = {title}
    RETURN content
  `;
  return runQueryAndGetRecord(driver.session(), query, queryParams);
}

export function createViewer(driver, userEmail) {
  const queryParams = {
    email: userEmail,
    personId: uuidv4(),
  };
  // Use cypher FOREACH hack to only set nodeId for person if it isn't already set
  const query = `
    MERGE (person:Person {email:{email}})
    FOREACH (doThis IN CASE WHEN not(exists(person.nodeId)) THEN [1] ELSE [] END |
      SET person += {nodeId:{personId}, created:timestamp()})
    RETURN person
  `;
  return runQueryAndGetRecord(driver.session(), query, queryParams);
}

export function updateGraphTag(driver, args) {
  // if the Person node could be found
  const query = `
    MATCH (graphTag {nodeId: {nodeId}})
    MATCH (:Person)-[g:OWNS]->(graphTag)
    MATCH (owner:Person {email: {ownerEmail}})
    
    SET graphTag += {
      title: {title},
      description: {description},
      contentUrl: {contentUrl}
    }
    DELETE g, r
    CREATE (owner)-[:OWNS]->(graphTag)

    RETURN graphTag
  `;
  return runQueryAndGetRecord(driver.session(), query, args);
}

export function updateViewerName(driver, { name }, userEmail) {
  const queryParams = {
    name,
    email: userEmail,
    personId: uuidv4(),
  };
  // Use cypher FOREACH hack to only set nodeId for person if it isn't already set
  const query = `
    MERGE (person:Person {email:{email}})
    FOREACH (doThis IN CASE WHEN not(exists(person.nodeId)) THEN [1] ELSE [] END |
      SET person += {nodeId:{personId}, created:timestamp()})
    SET person.name = {name}
    RETURN person
  `;
  return runQueryAndGetRecord(driver.session(), query, queryParams);
}

export function softDeleteNode(driver, { nodeId }) {
  const query = `
    MATCH (n {nodeId: {nodeId}})
    SET n.deleted = timestamp()
    RETURN n
  `;
  return runQueryAndGetRecord(driver.session(), query, { nodeId });
}

export function addInterrelation(driver, { from, to }) {
  const queryParams = {
    fromId: from.nodeId,
    toId: to.nodeId,
  };
  const query = `
    MATCH (from {nodeId: {fromId}})
    MATCH (to {nodeId: {toId}})
    MERGE (from)-[:RELATES_TO]->(to)
    RETURN from, to
  `;
  return runQueryAndGetRecordWithFields(driver.session(), query, queryParams);
}

export function removeInterrelation(driver, { from, to }) {
  const queryParams = {
    fromId: from.nodeId,
    toId: to.nodeId,
  };
  const query = `
    MATCH (from {nodeId: {fromId}})-[r:RELATES_TO]->(to {nodeId: {toId}})
    DELETE r
    RETURN from, to
  `;
  return runQueryAndGetRecordWithFields(driver.session(), query, queryParams);
}

export function removeContentLink(driver, { from, to }) {
  const queryParams = {
    fromId: from.nodeId,
    toUrl: to.url,
  };
  const query = `
    MATCH (from {nodeId: {fromId}})-[r:IS_LINKED]->(to {url: {toUrl}})
    DELETE r
    RETURN from, to
  `;
  return runQueryAndGetRecordWithFields(driver.session(), query, queryParams);
}

export function searchPersons(driver, term) {
  const query = `
    MATCH (p:Person)
    WHERE
      (toLower(p.name) CONTAINS toLower({term}) OR toLower(p.email) CONTAINS toLower({term}))
      AND NOT EXISTS(p.deleted)
    RETURN p
  `;
  return runQueryAndGetRecords(driver.session(), query, { term });
}

export function searchApp(driver, label, term) {
  const query = `
    MATCH (n:${label})
    WHERE toLower(n.title) CONTAINS toLower({term}) AND NOT EXISTS(n.deleted)
    RETURN n
  `;
  return runQueryAndGetRecords(driver.session(), query, { term });
}

export function getPeopleTwoStepsFromApp(driver, { nodeId }) {
  const query = `
    MATCH (n {nodeId:'${nodeId}'})<-[*0..2]-(p:Person) 
    WITH collect(distinct p) as pe
    UNWIND pe as people
    RETURN people
  `;
  return runQueryAndGetRecords(driver.session(), query, { nodeId });
}

export function getEmailData(driver, { nodeId }) {
  const query = `
    MATCH (n {nodeId:'${nodeId}'})
    MATCH (n)<-[:OWNS*0..1]-(gu:Person)
    RETURN 
    labels(n) as graphTag_labels,
    n.description as description, 
    n.title as title, 
    gu.email as ownerEmail,
    tag.nodeId as linkedTagId
  `;
  return runQueryAndGetRawData(driver.session(), query, { nodeId });
}
