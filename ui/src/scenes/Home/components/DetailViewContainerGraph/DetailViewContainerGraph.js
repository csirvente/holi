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
      contentUrl
      owner {
        nodeId
        email
        name
      }
      contentLinks {
        nodeId
        title
        url
      }
      relatesToTags {
        nodeId
        title
      }
    }
    showDetailedEditView @client
  }
`;

const GET_TAG = createDetailViewQuery('tag');

const DetailViewContainerGraph = withAuth(withRouter(({ auth, match }) => {
  if (!match.params.tagId) return null;

  const queryProps = {
    query: GET_TAG,
    variables: {
      nodeId: match.params.tagId,
    },
  };

  return (
    <Query {...queryProps}>
      {({
 loading, error, data, client,
}) => {
          if (loading) return <WrappedLoader />;
          if (error) return `Error! ${error.message}`;
          const node = data.tag;
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
    },
  },
};

export default DetailViewContainerGraph;
