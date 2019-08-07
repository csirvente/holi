import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withRouter } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import { GET_TAGS } from '@/services/queries';
import DeleteNodeButton from './components/DeleteNodeButton';

const SOFT_DELETE_TAG = gql`
  mutation DeleteNodeContainer_softDeleteTag($nodeId: ID!) {
    softDeleteTag(nodeId: $nodeId) {
      nodeId
      deleted
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
        mutation={SOFT_DELETE_TAG}
        update={(cache, { data }) => {
          this.setState({ confirmationModalIsOpen: false });
          cache.writeData({ data: { showDetailedEditView: false } });

          const { tags } = cache.readQuery({ query: GET_TAGS });
            cache.writeQuery({
            query: GET_TAGS,
            data: {
              tags: tags.filter(n => n.nodeId !== data.softDeleteTag.nodeId),
            },
            });
          this.props.history.push('/');
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
