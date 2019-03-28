import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ListGroup, ListGroupItem } from 'reactstrap';
import TypeBadge from '@/components/TypeBadge';
import RemoveInterrelation from './components/RemoveInterrelation';

const StyledListGroupItem = styled(ListGroupItem)`
  position: relative;
  ${props => props.showremove && 'padding-right: 6em;'}
`;

const RemoveWrapper = styled.span`
  position: absolute;
  top: 0.54em;
  right: 0.54em;
`;

const Interrelations = ({ interrelations, showRemove }) => (
  <ListGroup>
    {interrelations.map(({
      node: {
        __typename,
        nodeId,
        title,
        },
      onClick,
      }) => (
        <StyledListGroupItem
          key={nodeId}
          tag="div"
          href="#"
          action
          onClick={onClick}
          showremove={showRemove ? 'true' : '' /* styled component doesn't want a boolean */}
        >
          <TypeBadge nodeType={__typename} />
          {title}
          {showRemove && (
            <RemoveWrapper>
              <RemoveInterrelation nodeType={__typename} nodeId={nodeId} />
            </RemoveWrapper>
          )}
        </StyledListGroupItem>
    ))}
  </ListGroup>
);

Interrelations.propTypes = {
  interrelations: PropTypes.arrayOf(PropTypes.shape({
    node: PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
    }),
    onClick: PropTypes.func,
  })),
  showRemove: PropTypes.bool,
};

Interrelations.defaultProps = {
  interrelations: [],
  showRemove: false,
};

export default Interrelations;
