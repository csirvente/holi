import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Graph from 'react-graph-vis';
import _ from 'lodash';
import { Popover, PopoverBody, PopoverHeader } from 'reactstrap';
import graphUtils from '@/services/graphUtils';
import WrappedLoader from '@/components/WrappedLoader';

const TAG_FRAGMENT = gql`
  fragment LocalGraphTagFields on Tag {
    nodeId
    title
    description
    owner {
      nodeId
      email
      name
    }
  }
`;

const CONTENT_LINK_FRAGMENT = gql`
  fragment LocalGraphContentLinkFields on Content {
    nodeId
    title
    url
  }
`;

const GET_TAG = gql`
  query LocalGraph_tag($nodeId: ID!) {
    tag(nodeId: $nodeId) {
      ...LocalGraphTagFields

      relatesToTags {
        ...LocalGraphTagFields
      }

      tagsThatRelateToThis {
        ...LocalGraphTagFields
      }

      contentLinks {
        ...LocalGraphContentLinkFields
      }
    }
  }
  ${TAG_FRAGMENT}
  ${CONTENT_LINK_FRAGMENT}
`;

const GET_CONTENT_LINK = gql`
  query LocalGraph_contentLink($nodeId: ID!) {
    contentLink(nodeId: $nodeId) {
      ...LocalGraphContentLinkFields
      isLinked {
        ...LocalGraphTagFields
      }
      relatesToTags {
        ...LocalGraphTagFields
      }
      tagsThatRelateToThis {
        ...LocalGraphTagFields
      }
    }
  }
  ${TAG_FRAGMENT}
  ${CONTENT_LINK_FRAGMENT}
`;

const TAG_ON_PERSON_FRAGMENT = gql`
  fragment TagOnPerson on Tag {
    nodeId
    title
    owner {
      nodeId
      name
    }
  }
`;

const GET_PERSON = gql`
  query LocalGraphPersonFields($nodeId: ID!) {
    person(nodeId: $nodeId) {
      nodeId
      name
      ownsTags {
        ...TagOnPerson
      }
    }
  }
  ${TAG_ON_PERSON_FRAGMENT}
`;

const graphOptions = {
  layout: {
    improvedLayout: true,
  },
  edges: {
    color: '#000000',
    font: {
      align: 'top',
    },
    smooth: {
      enabled: true,
      type: 'dynamic',
      roundness: 0.5,
    },
  },
  nodes: {
    shape: 'box',
    font: {
      color: '#fff',
    },
  },
  physics: {
    barnesHut: {
      gravitationalConstant: -4000,
      centralGravity: 0.3,
      springLength: 95,
      springConstant: 0.04,
      damping: 0.09,
      avoidOverlap: 0,
    },
  },
};

class LocalGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodeId !== this.props.nodeId) {
      this.setState({ selectedNode: null });
    }
  }

  onSelectNode = ({ nodes }, graphData) => {
    const selectedNodeId = nodes && nodes[0];
    const graphNode = _.find(graphData.nodes, { id: selectedNodeId });
    this.setState({ selectedNode: graphNode });
  };

  render() {
    const { nodeType, nodeId } = this.props;
    const { selectedNode } = this.state;

    let gqlQuery;
    if (nodeType === 'Tag') {
      gqlQuery = GET_TAG;
    } else if (nodeType === 'ContentLink') {
      gqlQuery = GET_CONTENT_LINK;
    } else {
      gqlQuery = GET_PERSON;
    }

    return (
      <Query query={gqlQuery} variables={{ nodeId, nodeType }}>
        {({
 loading, error, data, refetch,
}) => {
          if (loading) return <WrappedLoader />;
          if (error) return `Error! ${error.message}`;
          // The next line is a temporary hack to make up for a bug in Apollo where
          // the query returns an empty data object sometimes:
          // https://github.com/apollographql/apollo-client/issues/3267
          if (!data.tag && !data.links && !data.person) refetch();

          let node;
          if (nodeType === 'Tag') node = data.tag;
          else if (nodeType === 'ContentLink') node = data.contentLink;
          else node = data.person;

          if (!node) return null;
          let graphData;
          if (nodeType === 'Person') { graphData = graphUtils.getPersonGraph(node); } else graphData = graphUtils.getSubGraph(node);
          return (
            <div>
              <div id="localGraphWrapper">
                <Graph
                  graph={graphData}
                  options={graphOptions}
                  events={{
                    select: event => this.onSelectNode(event, graphData),
                  }}
                  style={{ height: '25em' }}
                />
              </div>
              <Popover
                placement="left"
                isOpen={!!selectedNode}
                target="localGraphWrapper"
              >
                <PopoverHeader>
                  {selectedNode && selectedNode.title}
                </PopoverHeader>
                <PopoverBody>
                  {_.truncate(selectedNode && selectedNode.description, {
                    length: 512,
                    separator: ',.?! ',
                  })}
                </PopoverBody>
              </Popover>
            </div>
          );
        }}
      </Query>
    );
  }
}

LocalGraph.propTypes = {
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
};

LocalGraph.defaultProps = {
  nodeType: '',
  nodeId: '',
};

export default LocalGraph;
