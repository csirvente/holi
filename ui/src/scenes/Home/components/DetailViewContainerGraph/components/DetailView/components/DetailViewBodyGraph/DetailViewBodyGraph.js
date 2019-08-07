import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Card, CardBody, CardTitle } from 'reactstrap';
import Interrelations from '@/components/Interrelations';
import LocalGraph from '@/components/LocalGraph';

const LabelSpan = styled.span`
  font-weight: bold;
  margin-right: 0.5em;
`;

const CardSection = styled.div`
  margin-bottom: 1rem;
`;

const DetailViewBodyGraph = ({ node }) => (
  <CardBody>
    <CardTitle>{node.title}</CardTitle>

    <CardSection>
      <LabelSpan>Graph:</LabelSpan>
      <Card>
        <LocalGraph nodeType={node.__typename} nodeId={node.nodeId} />
      </Card>
    </CardSection>
    <CardSection>
      <LabelSpan>Tags:</LabelSpan>
      <Interrelations
        nodeType={node.__typename}
        nodeId={node.nodeId}
        interrelations={[
          ...(node.relatesToTags || []),
        ]}
      />
    </CardSection>
  </CardBody>
);

DetailViewBodyGraph.propTypes = {
  node: PropTypes.shape({
    __typename: PropTypes.string,
    nodeId: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    contentUrl: PropTypes.string,
    owner: PropTypes.shape({
      nodeId: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    relatesToTags: PropTypes.arrayOf(PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
    })),
  }),
};

DetailViewBodyGraph.defaultProps = {
  node: {
    nodeId: '',
    title: '',
    description: '',
    contentUrl: '',
    owner: {
      nodeId: '',
      email: '',
      name: '',
    },
    relatesToTags: [],
  },
};

export default DetailViewBodyGraph;
