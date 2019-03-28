// Queries that need to be accessible to several components (for reusability, cache updates, etc.)

import gql from 'graphql-tag';

export const GET_TAGS = gql`
  query Tags {
    tags {
      nodeId
      title
      fulfilledBy {
        nodeId
        title
        realizer {
          nodeId
          name
        }
      }
    }
  }
`;

export const GET_RESPONSIBILITIES = gql`
  query Responsibilities($tagId: ID!) {
    responsibilities(fulfillsTagId: $tagId) {
      nodeId
      title
      realizer {
        nodeId
        name
      }
    }
  }
`;

export const GET_REALITY_INFOS = gql`
  query RealityInfos($realityId: ID!) {
    reality(nodeId: $realityId) {
      nodeId
      fulfilledBy {
        nodeId
        title
        url
      }
    }
  }
`;
