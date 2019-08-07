// Queries that need to be accessible to several components (for reusability, cache updates, etc.)

import gql from 'graphql-tag';

export const GET_TAGS = gql`
  query Tags {
    tags {
      nodeId
      title
    }
  }
`;

export const GET_GRAPHTAG_CONTENTS = gql`
  query GraphTagContents($graphTagId: ID!) {
    graphTag(nodeId: $graphTagId) {
      nodeId
    }
  }
`;
