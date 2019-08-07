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
const AddInterrelation = ({ nodeId }) => {
  const ADD_TAG_INTERRELATION = ADD_TAG_RELATES_TO_TAGS;
  return (
    <Mutation mutation={ADD_TAG_INTERRELATION}>
      {(addTagInterrelation, { loading: loadingAddTag }) => (
        <FormGroup>
          <Label for="editDetailsTitle">Add tags</Label>
          <TypeaheadInput
            placeholder="Search tags"
            disabled={loadingAddTag}
            searchQuery={gql`
              query AddInterrelation_searchTags(
                $term: String!
              ) {
                tags(search: $term) {
                  nodeId
                  title
                }
              }
            `}
            queryDataToResultsArray={data => [
              ...(data.tags || []),
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
              addTagInterrelation({
                variables: {
                  from: { nodeId },
                  to: { nodeId: node.nodeId },
                },
              });
            }}
          />
        </FormGroup>
      )}
    </Mutation>
  );
};

AddInterrelation.propTypes = {
  nodeId: PropTypes.string,
};

AddInterrelation.defaultProps = {
  nodeId: '',
};

export default AddInterrelation;
