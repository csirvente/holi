import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'reactstrap'; // , CardBody, CardHeader
import DetailViewBodyGraph from './components/DetailViewBodyGraph';

const DetailView = ({
  node,

}) => (
  <Card>
    <DetailViewBodyGraph node={node} />
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

};

export default DetailView;
