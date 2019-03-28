import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { FormGroup, Label } from 'reactstrap';
import TypeaheadInput from '@/components/TypeaheadInput';
import TypeBadge from '@/components/TypeBadge';

const ADD_TAG_RELATES_TO_TAGS = gql`
  mutation AddInterrelation_addTagRelatesToTagsMutation(
    $from: _TagInput!
    $to: _TagInput!
  ) {
    addTagRelatesToTags(from: $from, to: $to) {
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

const ADD_TAG_RELATES_TO_RESPONSIBILITIES = gql`
  mutation AddInterrelation_addTagRelatesToResponsibilitiesMutation(
    $from: _TagInput!
    $to: _ResponsibilityInput!
  ) {
    addTagRelatesToResponsibilities(from: $from, to: $to) {
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

const ADD_RESPONSIBILITY_RELATES_TO_TAGS = gql`
  mutation AddInterrelation_addResponsibilityRelatesToTagsMutation(
    $from: _ResponsibilityInput!
    $to: _TagInput!
  ) {
    addResponsibilityRelatesToTags(from: $from, to: $to) {
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

const ADD_RESPONSIBILITY_RELATES_TO_RESPONSIBILITIES = gql`
  mutation AddInterrelation_addResponsibilityRelatesToResponsibilitiesMutation(
    $from: _ResponsibilityInput!
    $to: _ResponsibilityInput!
  ) {
    addResponsibilityRelatesToResponsibilities(from: $from, to: $to) {
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

const AddInterrelation = ({ nodeType, nodeId }) => {
  const ADD_TAG_INTERRELATION =
    nodeType === 'Tag'
      ? ADD_TAG_RELATES_TO_TAGS
      : ADD_RESPONSIBILITY_RELATES_TO_TAGS;
  const ADD_RESPONSIBILITY_INTERRELATION =
    nodeType === 'Tag'
      ? ADD_TAG_RELATES_TO_RESPONSIBILITIES
      : ADD_RESPONSIBILITY_RELATES_TO_RESPONSIBILITIES;
  return (
    <Mutation mutation={ADD_TAG_INTERRELATION}>
      {(addTagInterrelation, { loading: loadingAddTag }) => (
        <Mutation mutation={ADD_RESPONSIBILITY_INTERRELATION}>
          {(
            addResponsibilityInterrelation,
            { loading: loadingAddResponsibility },
          ) => (
            <FormGroup>
              <Label for="editDetailsTitle">Add tags</Label>
              <TypeaheadInput
                placeholder="Search tags"
                disabled={loadingAddTag || loadingAddResponsibility}
                searchQuery={gql`
                  query AddInterrelation_searchTagsAndResponsibilities(
                    $term: String!
                  ) {
                    tags(search: $term) {
                      nodeId
                      title
                    }
                    responsibilities(search: $term) {
                      nodeId
                      title
                    }
                  }
                `}
                queryDataToResultsArray={data => [
                  ...(data.tags || []),
                  ...(data.responsibilities || []),
                ]}
                itemToString={i => (i && i.title) || ''}
                itemToResult={i => (
                  <span>
                    <TypeBadge nodeType={i.__typename} />
                    {i.title}
                  </span>
                )}
                onChange={(node, { reset, clearSelection }) => {
                  clearSelection();
                  reset();
                  if (node.__typename === 'Tag') {
                    addTagInterrelation({
                      variables: {
                        from: { nodeId },
                        to: { nodeId: node.nodeId },
                      },
                    });
                  } else {
                    addResponsibilityInterrelation({
                      variables: {
                        from: { nodeId },
                        to: { nodeId: node.nodeId },
                      },
                    });
                  }
                }}
              />
            </FormGroup>
          )}
        </Mutation>
      )}
    </Mutation>
  );
};

AddInterrelation.propTypes = {
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
};

AddInterrelation.defaultProps = {
  nodeType: 'Tag',
  nodeId: '',
};

export default AddInterrelation;
