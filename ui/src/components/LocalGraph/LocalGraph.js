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
    guide {
      nodeId
      email
      name
    }
    realizer {
      nodeId
      email
      name
    }
  }
`;

const RESPONSIBILITY_FRAGMENT = gql`
  fragment LocalGraphResponsibilityFields on Responsibility {
    nodeId
    title
    description
    guide {
      nodeId
      email
      name
    }
    realizer {
      nodeId
      email
      name
    }
  }
`;

const GET_TAG = gql`
  query LocalGraph_tag($nodeId: ID!) {
    tag(nodeId: $nodeId) {
      ...LocalGraphTagFields
      fulfilledBy {
        ...LocalGraphResponsibilityFields
      }
      relatesToTags {
        ...LocalGraphTagFields
      }
      relatesToResponsibilities {
        ...LocalGraphResponsibilityFields
      }
      tagsThatRelateToThis {
        ...LocalGraphTagFields
      }
      responsibilitiesThatRelateToThis {
        ...LocalGraphResponsibilityFields
      }
    }
  }
  ${TAG_FRAGMENT}
  ${RESPONSIBILITY_FRAGMENT}
`;

const GET_RESPONSIBILITY = gql`
  query LocalGraph_responsibility($nodeId: ID!) {
    responsibility(nodeId: $nodeId) {
      ...LocalGraphResponsibilityFields
      fulfills {
        ...LocalGraphTagFields
      }
      relatesToTags {
        ...LocalGraphTagFields
      }
      relatesToResponsibilities {
        ...LocalGraphResponsibilityFields
      }
      tagsThatRelateToThis {
        ...LocalGraphTagFields
      }
      responsibilitiesThatRelateToThis {
        ...LocalGraphResponsibilityFields
      }
    }
  }
  ${TAG_FRAGMENT}
  ${RESPONSIBILITY_FRAGMENT}
`;

const TAG_ON_PERSON_FRAGMENT = gql`
  fragment TagOnPerson on Tag {
    nodeId
    title
    guide {
      nodeId
      name
    }
    realizer {
      nodeId
      name
    }
    fulfilledBy {
      nodeId
      title
      guide {
        nodeId
        name
      }
      realizer {
        nodeId
        name
      }
    }
  }
`;
const RESPONSIBILITY_ON_PERSON_FRAGMENT = gql`
  fragment ResponsibilityOnPerson on Responsibility {
    nodeId
    title
    relatesToResponsibilities {
      nodeId
      title
      guide {
        nodeId
        name
      }
    }
    guide {
      nodeId
      name
    }
    realizer {
      nodeId
      name
    }
    fulfills {
      nodeId
      title
      guide {
        nodeId
        name
      }
      realizer {
        nodeId
        name
      }
    }
  }
`;
const GET_PERSON = gql`
  query LocalGraphPersonFields($nodeId: ID!) {
    person(nodeId: $nodeId) {
      nodeId
      name
      guidesTags {
        ...TagOnPerson
      }
      realizesTags {
        ...TagOnPerson
      }
      guidesResponsibilities {
        ...ResponsibilityOnPerson
      }
      realizesResponsibilities {
        ...ResponsibilityOnPerson
      }
    }
  }
  ${TAG_ON_PERSON_FRAGMENT}
  ${RESPONSIBILITY_ON_PERSON_FRAGMENT}
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
    } else if (nodeType === 'Responsibility') {
      gqlQuery = GET_RESPONSIBILITY;
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
          if (!data.tag && !data.responsibility && !data.person) refetch();

          let node;
          if (nodeType === 'Tag') node = data.tag;
          else if (nodeType === 'Responsibility') node = data.responsibility;
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
                  style={{ height: '40em' }}
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
