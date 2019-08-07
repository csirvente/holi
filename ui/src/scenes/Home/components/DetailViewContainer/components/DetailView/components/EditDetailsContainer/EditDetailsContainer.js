import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import * as yup from 'yup';
import { Mutation } from 'react-apollo';
import { Formik } from 'formik';
import EditDetailsForm from './components/EditDetailsForm';

const createEditDetailsMutation = nodeType => gql`
  mutation EditDetailsContainer_update${nodeType}(
    $nodeId: ID!
    $title: String!
    $ownerEmail: String!
    $description: String
    $contentUrl: String
  ) {
    update${nodeType}(
      nodeId: $nodeId
      title: $title
      ownerEmail: $ownerEmail
      description: $description
      contentUrl: $contentUrl
    ) {
      nodeId
      title
      description
      contentUrl
      owner {
        nodeId
        email
        name
      }
    }
  }
`;

const EditDetailsContainer = ({ node }) => (
  <Mutation mutation={createEditDetailsMutation(node.__typename)}>
    {(updateNode, { client }) => (
      <Formik
        initialValues={{
          title: node.title || '',
          owner: node.owner || null,
          description: node.description || '',
          contentUrl: node.contentUrl || '',
        }}
        enableReinitialize
        validationSchema={yup.object().shape({
          title: yup.string().required('Title is required'),
          owner: yup.object().shape({
            email: yup.string().required(),
          }).typeError('Owner is required').required(),
          description: yup.string().nullable(),
          contentUrl: yup.string().nullable(),
        })}
        onSubmit={(values, { resetForm }) => {
          updateNode({
            variables: {
              nodeId: node.nodeId,
              title: values.title,
              ownerEmail: values.owner && values.owner.email,
              description: values.description,
              contentUrl: values.contentUrl,
            },
          }).then(() => {
            resetForm();
            client.writeData({ data: { showDetailedEditView: false } });
          });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          isSubmitting,
        }) => (
          <EditDetailsForm
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleSubmit={handleSubmit}
            setFieldValue={setFieldValue}
            isSubmitting={isSubmitting}
            cancel={() => client.writeData({ data: { showDetailedEditView: false } })}
          />
        )}
      </Formik>
    )}
  </Mutation>
);

EditDetailsContainer.propTypes = {
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

EditDetailsContainer.defaultProps = {
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

export default EditDetailsContainer;
