import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { Query } from 'react-apollo';
import withAuth from '@/components/withAuth';
import WrappedLoader from '@/components/WrappedLoader';
import DetailView from './components/DetailView';

const createDetailViewQuery = nodeType => gql`
  query DetailViewContainerGraph_${nodeType}($nodeId: ID!) {
    ${nodeType}(nodeId: $nodeId) {
      nodeId
      title
      description
      deliberationLink
      guide {
        nodeId
        email
        name
      }
      realizer {
        nodeId
        email
        name
      }
      deliberations {
        nodeId
        title
        url
      }
      relatesToTags {
        nodeId
        title
      }
      relatesToResponsibilities {
        nodeId
        title
        fulfills {
          nodeId
        }
      }
    }
    showDetailedEditView @client
  }
`;

const GET_TAG = createDetailViewQuery('tag');
const GET_RESPONSIBILITY = createDetailViewQuery('responsibility');

const DetailViewContainerGraph = withAuth(withRouter(({ auth, match }) => {
  if (!match.params.tagId && !match.params.responsibilityId) return null;

  const queryProps = !match.params.responsibilityId
    ? {
      query: GET_TAG,
      variables: {
        nodeId: match.params.tagId,
      },
    }
    : {
      query: GET_RESPONSIBILITY,
      variables: {
        nodeId: match.params.responsibilityId,
      },
    };

  return (
    <Query {...queryProps}>
      {({
 loading, error, data, client,
}) => {
          if (loading) return <WrappedLoader />;
          if (error) return `Error! ${error.message}`;
          const node = !match.params.responsibilityId
            ? data.tag
            : data.responsibility;
          if (!node) return null;
          return (
            <DetailView
              node={node}
              showEdit={data.showDetailedEditView}
              isLoggedIn={auth.isLoggedIn}
              onClickEdit={() =>
                client.writeData({ data: { showDetailedEditView: true } })
              }
              onClickCancel={() =>
                client.writeData({ data: { showDetailedEditView: false } })
              }
            />
          );
        }}
    </Query>
  );
}));

DetailViewContainerGraph.propTypes = {
  auth: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      tagId: PropTypes.string,
      resposibilityId: PropTypes.string,
    }),
  }),
};

DetailViewContainerGraph.defaultProps = {
  auth: {
    isLoggedIn: false,
  },
  match: {
    params: {
      tagId: undefined,
      responsibilityId: undefined,
    },
  },
};

export default DetailViewContainerGraph;
