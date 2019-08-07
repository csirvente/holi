import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import withAuth from '@/components/withAuth';
import AddContentLink from './components/AddContentLink';
import ContentLinkList from './components/ContentLinkList';

const ContentLinks = withAuth(withRouter(({
  auth,
  nodeType,
  nodeId,
  contentLinks,
  showAddRemove,
}) => (
  <div>
    {auth.isLoggedIn && showAddRemove && (
      <AddContentLink nodeType={nodeType} nodeId={nodeId} />
    )}
    <ContentLinkList
      contentLinks={contentLinks.map(content => ({
        node: content,
      }))}
      showRemove={auth.isLoggedIn && showAddRemove}
    />
  </div>
)));

ContentLinks.propTypes = {
  auth: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
  contentLinks: PropTypes.arrayOf(PropTypes.shape({
    __typename: PropTypes.string,
    nodeId: PropTypes.string,
    title: PropTypes.string,
  })),
  showAddRemove: PropTypes.bool,
};

ContentLinks.defaultProps = {
  auth: {
    isLoggedIn: false,
  },
  history: {
    push: () => null,
  },
  nodeType: 'Content',
  nodeId: '',
  contentLinks: [],
  showAddRemove: false,
};

export default ContentLinks;
