import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { FaPencil, FaTimesCircle } from 'react-icons/lib/fa';
import colors from '@/styles/colors';
import IconButton from '@/components/IconButton';
import Interrelations from '@/components/Interrelations';
import Deliberations from '@/components/Deliberations';
import EditDetailsContainer from './components/EditDetailsContainer';
import DeleteNodeContainer from './components/DeleteNodeContainer';
import DetailViewBody from './components/DetailViewBody';

const DetailViewCardHeader = styled(CardHeader)`
  background-color: ${props => props.color};
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.5rem 0.7rem 0.5rem 1.25rem;
`;

const HeaderText = styled.span`
  line-height: 2.125rem;
`;

const HeaderButton = styled(IconButton)`
  font-size: 1.25rem;
  padding: 0 0.4rem 0.2rem 0.4rem;
`;

const Divider = styled.div`
  background-color: #ced4da;
  height: 1px;
  margin: 2rem 0;
`;

const DetailView = ({
  node,
  showEdit,
  isLoggedIn,
  onClickEdit,
  onClickCancel,
}) => (
  <Card>
    <DetailViewCardHeader
      color={
        node.__typename === 'Responsibility'
          ? colors.responsibility
          : colors.tag
      }
    >
      <HeaderText>Update {/* {node.__typename} */}</HeaderText>
      {isLoggedIn &&
        (showEdit ? (
          <HeaderButton onClick={onClickCancel}>
            <FaTimesCircle />
          </HeaderButton>
        ) : (
          <HeaderButton onClick={onClickEdit}>
            <FaPencil />
          </HeaderButton>
        ))}
    </DetailViewCardHeader>
    {showEdit ? (
      <CardBody>
        <EditDetailsContainer node={node} />
        <Divider />
        <Deliberations
          showAddRemove
          nodeType={node.__typename}
          nodeId={node.nodeId}
          deliberations={node.deliberations}
        />
        <Interrelations
          showAddRemove
          nodeType={node.__typename}
          nodeId={node.nodeId}
          interrelations={[
            ...(node.relatesToTags || []),
            ...(node.relatesToResponsibilities || []),
          ]}
        />
        <Divider />
        <DeleteNodeContainer nodeType={node.__typename} nodeId={node.nodeId} />
      </CardBody>
    ) : (
      <div>
        <DetailViewBody node={node} />
      </div>
    )}
  </Card>
);

DetailView.propTypes = {
  node: PropTypes.shape({
    __typename: PropTypes.string,
    nodeId: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    deliberations: PropTypes.arrayOf(PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
    })),
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
  showEdit: PropTypes.bool,
  isLoggedIn: PropTypes.bool,
  onClickEdit: PropTypes.func,
  onClickCancel: PropTypes.func,
};

DetailView.defaultProps = {
  node: {
    nodeId: '',
    title: '',
    description: '',
    deliberations: [],
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
    relatesToTags: [],
    relatesToResponsibilities: [],
  },
  showEdit: false,
  isLoggedIn: false,
  onClickEdit: () => null,
  onClickCancel: () => null,
};

export default DetailView;
