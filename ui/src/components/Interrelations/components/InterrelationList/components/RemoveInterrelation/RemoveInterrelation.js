import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import {
  Button,
} from 'reactstrap';

const REMOVE_TAG_RELATES_TO_TAGS = gql`
  mutation RemoveInterrelation_removeTagRelatesToTagsMutation(
    $from: _TagInput!
    $to: _TagInput!
  ) {
    removeTagRelatesToTags(from: $from, to: $to) {
      from {
        nodeId
        relatesToTags {
          nodeId
          title
        }
      }
    }
  }
`;

const RemoveInterrelation = withRouter(({ match, nodeId }) => {
  const REMOVE_TAG_INTERRELATION = REMOVE_TAG_RELATES_TO_TAGS;
  const REMOVE_INTERRELATION = REMOVE_TAG_INTERRELATION;
  return (
    <Mutation mutation={REMOVE_INTERRELATION}>
      {(removeInterrelation, { loading }) => (
        <Button
          size="sm"
          color="danger"
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation();
            removeInterrelation({
              variables: {
                from: { nodeId: match.params.tagId },
                to: { nodeId },
              },
            });
          }}
        >
          Remove
        </Button>
      )}
    </Mutation>
  );
});

RemoveInterrelation.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      tagId: PropTypes.string,
    }),
  }),
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
};

RemoveInterrelation.defaultProps = {
  match: {
    params: {
      tagId: undefined,
    },
  },
  nodeType: 'Tag',
  nodeId: '',
};

export default RemoveInterrelation;
