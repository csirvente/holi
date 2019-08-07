import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CardBody, CardText, CardTitle } from 'reactstrap'; // Card
import Interrelations from '@/components/Interrelations';
import ContentLinks from '@/components/ContentLinks';
// import LocalGraph from '@/components/LocalGraph';

const LabelSpan = styled.span`
  font-weight: bold;
  margin-right: 0.5em;
`;

const CardSection = styled.div`
  margin-bottom: 1rem;
`;

const DetailViewBody = ({ node }) => (
  <CardBody>
    <CardTitle>{node.title}</CardTitle>

    <CardText>
      <LabelSpan>Source:</LabelSpan>
      {node.owner &&
        (node.owner.name
          ? `${node.owner.name} (${node.owner.email})`
          : node.owner.email)}
    </CardText>

    <CardText>
      <LabelSpan>Description:</LabelSpan>
      {node.description}
    </CardText>

    <CardSection>
      <LabelSpan>linked content:</LabelSpan>
      <ContentLinks
        nodeType={node.__typename}
        nodeId={node.nodeId}
        contentLinks={[...(node.contentLinks || [])]}
      />
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

DetailViewBody.propTypes = {
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

DetailViewBody.defaultProps = {
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

export default DetailViewBody;
