import NormalizeUrl from 'normalize-url';
import { combineResolvers } from 'graphql-resolvers';
import { PubSub } from 'apollo-server';

import {
  findNodesByLabel,
  findNodeByLabelAndId,
  findNodeByLabelAndProperty,
  findNodesByRelationshipAndLabel,
  findNodeByRelationshipAndLabel,
  createTag,
  createResponsibility,
  createViewer,
  updateReality,
  updateViewerName,
  softDeleteNode,
  addInterrelation,
  removeInterrelation,
  addRealityHasDeliberation,
  removeDeliberation,
  searchPersons,
  searchRealities,
  getEmailData,
} from '../connectors';
import { isAuthenticated } from '../authorization';
import { sendUpdateMail } from '../../email/mailService';

const notify = (process.env.EMAIL_NOTIFICATIONS === 'enabled');

const pubsub = new PubSub();

const REALITY_CREATED = 'REALITY_CREATED';
const REALITY_DELETED = 'REALITY_DELETED';
const REALITY_UPDATED = 'REALITY_UPDATED';

const resolvers = {
  // root entry point to GraphQL service
  Subscription: {
    realityCreated: { subscribe: () => pubsub.asyncIterator([REALITY_CREATED]) },
    realityDeleted: { subscribe: () => pubsub.asyncIterator([REALITY_DELETED]) },
    realityUpdated: { subscribe: () => pubsub.asyncIterator([REALITY_UPDATED]) },
  },
  Query: {
    persons(obj, { search }, { driver }) {
      if (search) return searchPersons(driver, search);
      return findNodesByLabel(driver, 'Person');
    },
    person(obj, { nodeId, email }, { driver }) {
      if (email) return findNodeByLabelAndProperty(driver, 'Person', 'email', email);
      if (nodeId) return findNodeByLabelAndId(driver, 'Person', nodeId);
      const errorMessage =
        'Field "person" arguments "email" of type "String" and "nodeId" of type "ID" ' +
        'were both undefined. Please provide at least one.';
      return new Error(errorMessage);
    },
    tags(obj, { search }, { driver }) {
      if (search) return searchRealities(driver, 'Tag', search);
      return findNodesByLabel(driver, 'Tag');
    },
    tag(obj, { nodeId }, { driver }) {
      return findNodeByLabelAndId(driver, 'Tag', nodeId);
    },
    responsibilities(obj, { search, fulfillsTagId }, { driver }) {
      if (search) return searchRealities(driver, 'Responsibility', search);
      if (fulfillsTagId) return findNodesByRelationshipAndLabel(driver, fulfillsTagId, 'FULFILLS', 'Responsibility', 'IN');
      return findNodesByLabel(driver, 'Responsibility');
    },
    responsibility(obj, { nodeId }, { driver }) {
      return findNodeByLabelAndId(driver, 'Responsibility', nodeId);
    },
  },
  Person: {
    created({ created }) {
      return created.toString();
    },
    guidesTags({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'GUIDES', 'Tag');
    },
    realizesTags({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'REALIZES', 'Tag');
    },
    guidesResponsibilities({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'GUIDES', 'Responsibility');
    },
    realizesResponsibilities({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'REALIZES', 'Responsibility');
    },
  },
  Reality: {
    __resolveType(obj) {
      return obj.__label;
    },
    created({ created }) {
      return created.toString();
    },
    deleted({ deleted }) {
      return deleted.toString();
    },
    guide({ nodeId }, args, { driver }) {
      return findNodeByRelationshipAndLabel(driver, nodeId, 'GUIDES', 'Person', 'IN');
    },
    realizer({ nodeId }, args, { driver }) {
      return findNodeByRelationshipAndLabel(driver, nodeId, 'REALIZES', 'Person', 'IN');
    },
    relatesToTags({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'RELATES_TO', 'Tag');
    },
    relatesToResponsibilities({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'RELATES_TO', 'Responsibility');
    },
    tagsThatRelateToThis({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'RELATES_TO', 'Tag', 'IN');
    },
    responsibilitiesThatRelateToThis({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'RELATES_TO', 'Responsibility', 'IN');
    },
    deliberations({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'HAS_DELIBERATION', 'Info');
    },
  },
  Tag: {
    fulfilledBy({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'FULFILLS', 'Responsibility', 'IN');
    },
  },
  Responsibility: {
    fulfills({ nodeId }, args, { driver }) {
      return findNodeByRelationshipAndLabel(driver, nodeId, 'FULFILLS', 'Tag');
    },
  },
  Mutation: {
    createTag: combineResolvers(
      isAuthenticated,
      async (obj, { title }, { user, driver }) => {
        const tag = await createTag(driver, { title }, user.email);
        pubsub.publish(REALITY_CREATED, { realityCreated: tag });
        return tag;
      },
    ),
    createResponsibility: combineResolvers(
      isAuthenticated,
      async (obj, { title, tagId }, { user, driver }) => {
        const responsibility = await createResponsibility(driver, { title, tagId }, user.email);
        pubsub.publish(REALITY_CREATED, { realityCreated: responsibility });
        return responsibility;
      },
    ),
    createViewer: combineResolvers(
      isAuthenticated,
      (obj, args, { user, driver }) => createViewer(driver, user.email),
    ),
    updateTag: combineResolvers(
      isAuthenticated,
      async (obj, args, { driver, user }) => {
        const emailData = await getEmailData(driver, args);
        const tag = await updateReality(driver, args, user);
        pubsub.publish(REALITY_UPDATED, { realityUpdated: tag });
        if (tag && notify) {
          sendUpdateMail(
            driver,
            user,
            args,
            emailData,
            tag,
          );
        }
        return tag;
      },
    ),
    updateResponsibility: combineResolvers(
      isAuthenticated,
      async (obj, args, { driver, user }) => {
        const emailData = await getEmailData(driver, args);
        const responsibility = await updateReality(driver, args);
        pubsub.publish(REALITY_UPDATED, { realityUpdated: responsibility });
        if (responsibility && notify) {
          sendUpdateMail(
            driver,
            user,
            args,
            emailData,
            responsibility,
          );
        }
        return responsibility;
      },
    ),
    updateViewerName: combineResolvers(
      isAuthenticated,
      (obj, { name }, { user, driver }) => updateViewerName(driver, { name }, user.email),
    ),
    // TODO: Check if tag is free of responsibilities and dependents before soft deleting
    softDeleteTag: combineResolvers(
      isAuthenticated,
      async (obj, { nodeId }, { driver }) => {
        const tag = await softDeleteNode(driver, { nodeId });
        pubsub.publish(REALITY_DELETED, { realityDeleted: tag });
        return tag;
      },
    ),
    // TODO: Check if responsibility is free of dependents before soft deleting
    softDeleteResponsibility: combineResolvers(
      isAuthenticated,
      async (obj, { nodeId }, { driver }) => {
        const responsibility = await softDeleteNode(driver, { nodeId });
        pubsub.publish(REALITY_DELETED, { realityDeleted: responsibility });
        return responsibility;
      },
    ),
    addTagRelatesToTags: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => addInterrelation(driver, { from, to }),
    ),
    addTagRelatesToResponsibilities: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => addInterrelation(driver, { from, to }),
    ),
    addResponsibilityRelatesToTags: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => addInterrelation(driver, { from, to }),
    ),
    addResponsibilityRelatesToResponsibilities: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => addInterrelation(driver, { from, to }),
    ),
    addRealityHasDeliberation: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => {
        const normalizedTo = { url: NormalizeUrl(to.url, { stripHash: true }) };
        return addRealityHasDeliberation(driver, { from, to: normalizedTo });
      },
    ),
    removeRealityHasDeliberation: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => removeDeliberation(driver, { from, to }),
    ),
    removeTagRelatesToTags: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => removeInterrelation(driver, { from, to }),
    ),
    removeTagRelatesToResponsibilities: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => removeInterrelation(driver, { from, to }),
    ),
    removeResponsibilityRelatesToTags: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => removeInterrelation(driver, { from, to }),
    ),
    removeResponsibilityRelatesToResponsibilities: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => removeInterrelation(driver, { from, to }),
    ),
  },
};

export default resolvers;
