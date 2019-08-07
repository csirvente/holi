import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import {
  Button,
} from 'reactstrap';

const REMOVE_GRAPHTAG_IS_LINKED = gql`
  mutation RemoveContentLink_removeGraphTagIsLinkedMutation(
    $from: _GraphTagInput!
    $to: _ContentInput!
  ) {
    removeGraphTagIsLinked(from: $from, to: $to) {
      from {
        nodeId
        contentLinks {
          nodeId
        }
      }
    }
  }
`;

const RemoveContentLink = withRouter(({ match, url }) => (
  <Mutation mutation={REMOVE_GRAPHTAG_IS_LINKED}>
    {(removeContentLink, { loading }) => (
      <Button
        size="sm"
        color="danger"
        disabled={loading}
        onClick={(e) => {
          e.stopPropagation();
          removeContentLink({
            variables: {
              from: { nodeId: match.params.tagId },
              to: { url },
            },
          });
        }}
      >
        Remove
      </Button>
    )}
  </Mutation>
));

RemoveContentLink.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      tagId: PropTypes.string,
    }),
  }),
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
};

RemoveContentLink.defaultProps = {
  match: {
    params: {
      tagId: undefined,
    },
  },
  nodeType: 'Content',
  nodeId: '',
};

export default RemoveContentLink;
