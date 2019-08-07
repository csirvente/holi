import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ListGroup, ListGroupItem } from 'reactstrap';
import TypeBadge from '@/components/TypeBadge';
import RemoveContentLink from './components/RemoveContentLink';

const StyledListGroup = styled(ListGroup)`
  margin-bottom: 2em;
`;

const StyledListGroupItem = styled(ListGroupItem)`
  position: relative;
  ${props => props.showremove && 'padding-right: 6em;'}
`;

const RemoveWrapper = styled.span`
  position: absolute;
  top: 0.54em;
  right: 0.54em;
`;

const ContentLinkList = ({ contentLinks, showRemove }) => {
  const handleClick = (url) => {
    const win = window.open(url, '_blank');
    win.focus();
  };
  return (
    <StyledListGroup>
      {contentLinks.map(({
        node: {
          __typename,
          nodeId,
          title,
          url,
          },
        }) => (
          <StyledListGroupItem
            key={nodeId}
            tag="div"
            action
            onClick={() => handleClick(url)}
            showremove={showRemove ? 'true' : '' /* styled component doesn't want a boolean */}
          >
            <TypeBadge nodeType={__typename} />
            {title || url}
            {showRemove && (
              <RemoveWrapper>
                <RemoveContentLink nodeType={__typename} nodeId={nodeId} url={url} />
              </RemoveWrapper>
            )}
          </StyledListGroupItem>
        ))}
    </StyledListGroup>
  );
};

ContentLinkList.propTypes = {
  contentLinks: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
    }),
    onClick: PropTypes.func,
  })),
  showRemove: PropTypes.bool,
};

ContentLinkList.defaultProps = {
  contentLinks: [],
  showRemove: false,
};

export default ContentLinkList;
