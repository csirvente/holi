import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import withAuth from '@/components/withAuth';
import AddInterrelation from './components/AddInterrelation';
import InterrelationList from './components/InterrelationList';

const Interrelations = withAuth(withRouter(({
  auth,
  history,
  nodeType,
  nodeId,
  interrelations,
  showAddRemove,
}) => (
  <div>
    {auth.isLoggedIn && showAddRemove && (
      <AddInterrelation nodeType={nodeType} nodeId={nodeId} />
    )}
    <InterrelationList
      interrelations={interrelations.map(dep => ({
        node: dep,
        onClick: () => history.push(dep.__typename === 'Tag'
          ? `/${dep.nodeId}`
          : `/${dep.fulfills.nodeId}/${dep.nodeId}`),
      }))}
      showRemove={auth.isLoggedIn && showAddRemove}
    />
  </div>
)));

Interrelations.propTypes = {
  auth: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
  interrelations: PropTypes.arrayOf(PropTypes.shape({
    __typename: PropTypes.string,
    nodeId: PropTypes.string,
    title: PropTypes.string,
    fulfills: PropTypes.shape({
      nodeId: PropTypes.string,
    }),
  })),
  showAddRemove: PropTypes.bool,
};

Interrelations.defaultProps = {
  auth: {
    isLoggedIn: false,
  },
  history: {
    push: () => null,
  },
  nodeType: 'Tag',
  nodeId: '',
  interrelations: [],
  showAddRemove: false,
};

export default Interrelations;
