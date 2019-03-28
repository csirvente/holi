import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import { GET_TAGS, GET_RESPONSIBILITIES } from '@/services/queries';
import DeleteNodeButton from './components/DeleteNodeButton';

const SOFT_DELETE_TAG = gql`
  mutation DeleteNodeContainer_softDeleteTag($nodeId: ID!) {
    softDeleteTag(nodeId: $nodeId) {
      nodeId
      deleted
    }
  }
`;

const SOFT_DELETE_RESPONSIBILITY = gql`
  mutation DeleteNodeContainer_softDeleteResponsibility($nodeId: ID!) {
    softDeleteResponsibility(nodeId: $nodeId) {
      nodeId
      deleted
      fulfills {
        nodeId
      }
    }
  }
`;

class DeleteNodeContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmationModalIsOpen: false,
    };
  }

  toggleConfirmationModal = () => {
    this.setState({ confirmationModalIsOpen: !this.state.confirmationModalIsOpen });
  };

  render() {
    return (
      <Mutation
        mutation={this.props.nodeType === 'Tag' ? SOFT_DELETE_TAG : SOFT_DELETE_RESPONSIBILITY}
        update={(cache, { data }) => {
          this.setState({ confirmationModalIsOpen: false });
          cache.writeData({ data: { showDetailedEditView: false } });
          if (this.props.nodeType === 'Tag') {
            const { tags } = cache.readQuery({ query: GET_TAGS });
            cache.writeQuery({
              query: GET_TAGS,
              data: {
                tags: tags.filter(n => n.nodeId !== data.softDeleteTag.nodeId),
              },
            });
            this.props.history.push('/');
          } else {
            const tagId = data.softDeleteResponsibility.fulfills.nodeId;
            const { responsibilities } = cache.readQuery({
              query: GET_RESPONSIBILITIES,
              variables: { tagId },
            });
            cache.writeQuery({
              query: GET_RESPONSIBILITIES,
              variables: { tagId },
              data: {
                responsibilities: responsibilities
                  .filter(r => r.nodeId !== data.softDeleteResponsibility.nodeId),
              },
            });
            this.props.history.push(`/${tagId}`);
          }
        }}
      >
        {(softDeleteNode, { loading, error }) => (
          <DeleteNodeButton
            nodeType={this.props.nodeType}
            confirmationModalIsOpen={this.state.confirmationModalIsOpen}
            onToggleConfirmationModal={this.toggleConfirmationModal}
            onConfirmSoftDelete={() => softDeleteNode({ variables: { nodeId: this.props.nodeId } })}
            loading={loading}
            error={error}
          />
        )}
      </Mutation>
    );
  }
}

DeleteNodeContainer.propTypes = {
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

DeleteNodeContainer.defaultProps = {
  nodeType: 'Tag',
  nodeId: '',
  history: {
    push: () => null,
  },
};

export default withRouter(DeleteNodeContainer);
