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
  createViewer,
  updateGraphTag,
  updateViewerName,
  softDeleteNode,
  addInterrelation,
  removeInterrelation,
  addGraphTagIsLinked,
  removeContentLink,
  searchPersons,
  searchApp,
  getEmailData,
} from '../connectors';
import { isAuthenticated } from '../authorization';
import { sendUpdateMail } from '../../email/mailService';

const notify = (process.env.EMAIL_NOTIFICATIONS === 'enabled');

const pubsub = new PubSub();

const GRAPHTAG_CREATED = 'GRAPHTAG_CREATED';
const GRAPHTAG_DELETED = 'GRAPHTAG_DELETED';
const GRAPHTAG_UPDATED = 'GRAPHTAG_UPDATED';

const resolvers = {
  // root entry point to GraphQL service
  Subscription: {
    graphTagCreated: { subscribe: () => pubsub.asyncIterator([GRAPHTAG_CREATED]) },
    graphTagDeleted: { subscribe: () => pubsub.asyncIterator([GRAPHTAG_DELETED]) },
    graphTagUpdated: { subscribe: () => pubsub.asyncIterator([GRAPHTAG_UPDATED]) },
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
      if (search) return searchApp(driver, 'Tag', search);
      return findNodesByLabel(driver, 'Tag');
    },
    tag(obj, { nodeId }, { driver }) {
      return findNodeByLabelAndId(driver, 'Tag', nodeId);
    },
  },
  Person: {
    created({ created }) {
      return created.toString();
    },
    ownsTags({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'OWNS', 'Tag');
    },
  },
  GraphTag: {
    __resolveType(obj) {
      return obj.__label;
    },
    created({ created }) {
      return created.toString();
    },
    deleted({ deleted }) {
      return deleted.toString();
    },
    owner({ nodeId }, args, { driver }) {
      return findNodeByRelationshipAndLabel(driver, nodeId, 'OWNS', 'Person', 'IN');
    },
    relatesToTags({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'RELATES_TO', 'Tag');
    },
    tagsThatRelateToThis({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'RELATES_TO', 'Tag', 'IN');
    },
    contentLinks({ nodeId }, args, { driver }) {
      return findNodesByRelationshipAndLabel(driver, nodeId, 'IS_LINKED', 'Content');
    },
  },
  Tag: {
  },

  Mutation: {
    createTag: combineResolvers(
      isAuthenticated,
      async (obj, { title }, { user, driver }) => {
        const tag = await createTag(driver, { title }, user.email);
        pubsub.publish(GRAPHTAG_CREATED, { graphTagCreated: tag });
        return tag;
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
        const tag = await updateGraphTag(driver, args, user);
        pubsub.publish(GRAPHTAG_UPDATED, { graphTagUpdated: tag });
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
    updateViewerName: combineResolvers(
      isAuthenticated,
      (obj, { name }, { user, driver }) => updateViewerName(driver, { name }, user.email),
    ),
    softDeleteTag: combineResolvers(
      isAuthenticated,
      async (obj, { nodeId }, { driver }) => {
        const tag = await softDeleteNode(driver, { nodeId });
        pubsub.publish(GRAPHTAG_DELETED, { graphTagDeleted: tag });
        return tag;
      },
    ),

    addTagRelatesToTags: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => addInterrelation(driver, { from, to }),
    ),
    addGraphTagIsLinked: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => {
        const normalizedTo = { url: NormalizeUrl(to.url, { stripHash: true }), title: to.title };
        return addGraphTagIsLinked(driver, { from, to: normalizedTo });
      },
    ),
    removeGraphTagIsLinked: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => removeContentLink(driver, { from, to }),
    ),
    removeTagRelatesToTags: combineResolvers(
      isAuthenticated,
      (obj, { from, to }, { driver }) => removeInterrelation(driver, { from, to }),
    ),
  },
};

export default resolvers;
