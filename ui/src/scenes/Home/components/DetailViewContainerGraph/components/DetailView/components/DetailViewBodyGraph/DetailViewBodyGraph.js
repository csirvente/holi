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
      <LabelSpan>Tags:</LabelSpan>
      <Interrelations
        nodeType={node.__typename}
        nodeId={node.nodeId}
        interrelations={[
          ...(node.relatesToTags || []),
          ...(node.relatesToResponsibilities || []),
        ]}
      />
    </CardSection>

    <CardSection>
      <LabelSpan>Graph:</LabelSpan>
      <Card>
        <LocalGraph nodeType={node.__typename} nodeId={node.nodeId} />
      </Card>
    </CardSection>
  </CardBody>
);

DetailViewBodyGraph.propTypes = {
  node: PropTypes.shape({
    __typename: PropTypes.string,
    nodeId: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    deliberationLink: PropTypes.string,
    guide: PropTypes.shape({
      nodeId: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    realizer: PropTypes.shape({
      nodeId: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    hasDeliberations: PropTypes.arrayOf(PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
      url: PropTypes.string,
    })),
    relatesToTags: PropTypes.arrayOf(PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
    })),
    relatesToResponsibilities: PropTypes.arrayOf(PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
      fulfills: PropTypes.shape({
        nodeId: PropTypes.string,
      }),
    })),
  }),
};

DetailViewBodyGraph.defaultProps = {
  node: {
    nodeId: '',
    title: '',
    description: '',
    deliberationLink: '',
    guide: {
      nodeId: '',
      email: '',
      name: '',
    },
    realizer: {
      nodeId: '',
      email: '',
      name: '',
    },
    hasDeliberations: [],
    relatesToTags: [],
    relatesToResponsibilities: [],
  },
};

export default DetailViewBodyGraph;
