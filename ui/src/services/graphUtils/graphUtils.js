import _ from 'lodash';
import colors from '@/styles/colors';

const colorCollection = {
  Tag: colors.tag,
  Person: colors.person,
};

function getNodeTitle(node) {
  return node.__typename === 'Person' ? (node.name || node.email) : node.title;
}

function getNodeDescription(node) {
  if (node.__typename === 'Person') return node.name ? node.email : null;
  return node.description;
}

function pushNode(graph, originNode, node, relation, direction) {
  if (!node) return graph;

  if (Array.isArray(node)) {
    node.forEach((element) => {
      pushNode(graph, originNode, element, relation, direction);
    });
    return graph;
  }

  const trimmedLabel = _.truncate(getNodeTitle(node), { length: 12, separator: ',.?! ' });
  if (!_.find(graph.nodes, { id: node.nodeId })) {
    graph.nodes.push({
      id: node.nodeId,
      label: trimmedLabel,
      color: colorCollection[node.__typename],
      title: getNodeTitle(node),
      description: getNodeDescription(node),
    });
  }
  if (direction === 'IN') {
    graph.edges.push({
      from: originNode.nodeId,
      to: node.nodeId,
      label: relation,
    });
  } else {
    graph.edges.push({
      from: node.nodeId,
      to: originNode.nodeId,
      label: relation,
    });
  }

  return graph;
}

function getSubGraph(originNode = {}) {
  const trimmedLabel = _.truncate(originNode.title, { length: 12, separator: ',.?! ' });
  const graph = {
    nodes: [
      {
        id: originNode.nodeId,
        label: trimmedLabel,
        color: colorCollection[originNode.__typename],
        title: originNode.title,
        shape: 'ellipse',
        description: originNode.description,
      },
    ],
    edges: [],
  };

  pushNode(graph, originNode, originNode.owner, 'Owns', 'OUT');
  pushNode(graph, originNode, originNode.relatesToTags, 'Relates to', 'IN');
  pushNode(graph, originNode, originNode.tagsThatRelateToThis, 'Relates to', 'OUT');
  pushNode(graph, originNode, originNode.contentLinks, 'Is linked to', 'OUT');

  return graph;
}
function getPersonGraph(originNode = {}) {
  const trimmedLabel = _.truncate(originNode.name, { length: 12, separator: ',.?! ' });
  const graph = {
    nodes: [
      {
        id: originNode.nodeId,
        label: trimmedLabel,
        color: colorCollection[originNode.__typename],
        title: originNode.name,
        shape: 'ellipse',
        description: originNode.description,
      },
    ],
    edges: [],
  };

  /*  function pushNodesToSubsequentNodes(userNodeId, nodes, role, relation) {
    nodes.forEach((node) => {
      // The following check is to prevent duplicate edges between a
      // tag and a person.
      if (node[role] && node[role].nodeId !== userNodeId) {
        pushNode(graph, node, node[role], relation, 'IN');
      }
    });
  } */

  pushNode(graph, originNode, originNode.ownsTags, 'Owns', 'IN');
  // pushNodesToSubsequentNodes(originNode.nodeId, originNode.ownsTags, 'owner', 'Owns');

  return graph;
}

export default { getSubGraph, getPersonGraph };
