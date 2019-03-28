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
    $guideEmail: String!
    $realizerEmail: String
    $description: String
    $deliberationLink: String
  ) {
    update${nodeType}(
      nodeId: $nodeId
      title: $title
      guideEmail: $guideEmail
      realizerEmail: $realizerEmail
      description: $description
      deliberationLink: $deliberationLink
    ) {
      nodeId
      title
      description
      deliberationLink
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
  }
`;

const EditDetailsContainer = ({ node }) => (
  <Mutation mutation={createEditDetailsMutation(node.__typename)}>
    {(updateNode, { client }) => (
      <Formik
        initialValues={{
          title: node.title || '',
          guide: node.guide || null,
          realizer: node.realizer || null,
          description: node.description || '',
          deliberationLink: node.deliberationLink || '',
        }}
        enableReinitialize
        validationSchema={yup.object().shape({
          title: yup.string().required('Title is required'),
          guide: yup.object().shape({
            email: yup.string().required(),
          }).typeError('Guide is required').required(),
          realizer: yup.object().shape({
            email: yup.string(),
          }).nullable(),
          description: yup.string().nullable(),
          deliberationLink: yup.string().nullable(),
        })}
        onSubmit={(values, { resetForm }) => {
          updateNode({
            variables: {
              nodeId: node.nodeId,
              title: values.title,
              guideEmail: values.guide && values.guide.email,
              realizerEmail: values.realizer && values.realizer.email,
              description: values.description,
              deliberationLink: values.deliberationLink,
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

EditDetailsContainer.defaultProps = {
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
    relatesToTags: [],
    relatesToResponsibilities: [],
  },
};

export default EditDetailsContainer;
