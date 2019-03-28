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

const REMOVE_TAG_RELATES_TO_RESPONSIBILITIES = gql`
  mutation RemoveInterrelation_removeTagRelatesToResponsibilitiesMutation(
    $from: _TagInput!
    $to: _ResponsibilityInput!
  ) {
    removeTagRelatesToResponsibilities(from: $from, to: $to) {
      from {
        nodeId
        relatesToResponsibilities {
          nodeId
          title
          fulfills {
            nodeId
          }
        }
      }
    }
  }
`;

const REMOVE_RESPONSIBILITY_RELATES_TO_TAGS = gql`
  mutation RemoveInterrelation_removeResponsibilityRelatesToTagsMutation(
    $from: _ResponsibilityInput!
    $to: _TagInput!
  ) {
    removeResponsibilityRelatesToTags(from: $from, to: $to) {
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

const REMOVE_RESPONSIBILITY_RELATES_TO_RESPONSIBILITIES = gql`
  mutation RemoveInterrelation_removeResponsibilityRelatesToResponsibilitiesMutation(
    $from: _ResponsibilityInput!
    $to: _ResponsibilityInput!
  ) {
    removeResponsibilityRelatesToResponsibilities(from: $from, to: $to) {
      from {
        nodeId
        relatesToResponsibilities {
          nodeId
          title
          fulfills {
            nodeId
          }
        }
      }
    }
  }
`;

const RemoveInterrelation = withRouter(({ match, nodeType, nodeId }) => {
  const fromType = match.params.responsibilityId ? 'Responsibility' : 'Tag';
  const REMOVE_TAG_INTERRELATION = fromType === 'Tag'
    ? REMOVE_TAG_RELATES_TO_TAGS
    : REMOVE_RESPONSIBILITY_RELATES_TO_TAGS;
  const REMOVE_RESPONSIBILITY_INTERRELATION = fromType === 'Tag'
    ? REMOVE_TAG_RELATES_TO_RESPONSIBILITIES
    : REMOVE_RESPONSIBILITY_RELATES_TO_RESPONSIBILITIES;
  const REMOVE_INTERRELATION = nodeType === 'Tag'
    ? REMOVE_TAG_INTERRELATION
    : REMOVE_RESPONSIBILITY_INTERRELATION;
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
                from: { nodeId: match.params.responsibilityId || match.params.tagId },
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
      responsibilityId: PropTypes.string,
    }),
  }),
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
};

RemoveInterrelation.defaultProps = {
  match: {
    params: {
      tagId: undefined,
      responsibilityId: undefined,
    },
  },
  nodeType: 'Tag',
  nodeId: '',
};

export default RemoveInterrelation;
