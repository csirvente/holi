// Subscriptions that need to be accessible to several components

import gql from 'graphql-tag';

export const GRAPHTAGS_CREATE_SUBSCRIPTION = gql`
  subscription graphTagCreated {
    graphTagCreated {
      title
      nodeId
    }
  }

`;

export const GRAPHTAGS_DELETE_SUBSCRIPTION = gql`
  subscription graphTagDeleted {
    graphTagDeleted {
      nodeId
      title
      owner {
        email
      }
      description
      contentUrl
    }
  }
`;

export const GRAPHTAGS_UPDATE_SUBSCRIPTION = gql`
  subscription graphTagUpdated {
    graphTagUpdated {
      nodeId
      title
      description
      contentUrl
      owner {
        nodeId
        email
        name
      }
      relatesToTags {
        nodeId
        title
      }
      contentLinks {
        nodeId
        url
        title
      }
    }
  }
`;
