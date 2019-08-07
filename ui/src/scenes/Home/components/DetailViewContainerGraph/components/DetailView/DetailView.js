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
    contentLinks: PropTypes.arrayOf(PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
    })),
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

DetailView.defaultProps = {
  node: {
    nodeId: '',
    title: '',
    description: '',
    contentLinks: [],
    owner: {
      nodeId: '',
      email: '',
      name: '',
    },
    relatesToTags: [],
  },

};

export default DetailView;
