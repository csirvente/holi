import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { ListGroup, ListGroupItem } from 'reactstrap';
import colors from '@/styles/colors';
import RealizersMissingIcon from '@/components/RealizersMissingIcon';

const TagsListGroup = styled(ListGroup)`
  margin-bottom: 1rem;
`;

const TagsListGroupItem = styled(ListGroupItem)`
  display: flex;
  justify-content: space-between;
  &:focus {
    outline: none;
  }
  &.active {
    background-color: ${colors.tag};
    border-color: ${colors.tag};
    color: white;
  }
`;

const RightMarginSpan = styled.span`
  margin-right: 10px;
`;

const renderMissingRealizersAmount = (tag) => {
  let realizersMissing = [];
  if (tag.fulfilledBy) {
    realizersMissing = tag.fulfilledBy.filter(resp => !resp.realizer);
  }

  if (realizersMissing.length > 0) {
    return (
      <div>
        <RightMarginSpan>{realizersMissing.length}x</RightMarginSpan> <RealizersMissingIcon />
      </div>
    );
  }
  return '';
};

class TagsList extends Component {
  componentDidMount() {
    this.props.subscribeToTagsEvents();
  }

  render() {
    const { tags, selectedTagId, history } = this.props;
    return (
      <div>
        <TagsListGroup>
          {tags.map(tag => (
            <TagsListGroupItem
              key={tag.nodeId}
              tag="button"
              href="#"
              action
              active={tag.nodeId === selectedTagId}
              onClick={() => history.push(`/${tag.nodeId}`)}
            >
              {tag.title}
              {renderMissingRealizersAmount(tag)}
            </TagsListGroupItem>
          ))}
        </TagsListGroup>
      </div>
    );
  }
}

TagsList.propTypes = {
  subscribeToTagsEvents: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.shape({
    nodeId: PropTypes.string,
    title: PropTypes.string,
  })),
  selectedTagId: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

TagsList.defaultProps = {
  tags: [],
  selectedTagId: undefined,
  history: {
    push: () => null,
  },
};

export default withRouter(TagsList);
