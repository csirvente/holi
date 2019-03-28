import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import * as yup from 'yup';
import { withRouter } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import { Formik } from 'formik';
import { GET_RESPONSIBILITIES } from '@/services/queries';
import ListForm from '@/components/ListForm';

const CREATE_RESPONSIBILITY = gql`
  mutation CreateResponsibility_createResponsibilityMutation($title: String!, $tagId: ID!) {
    createResponsibility(title: $title, tagId: $tagId) {
      nodeId
      title
      realizer {
        nodeId
        name
      }
    }
  }
`;

const CreateResponsibility = withRouter(({ match, history }) => (
  <Mutation
    mutation={CREATE_RESPONSIBILITY}
    update={(cache, { data: { createResponsibility } }) => {
      cache.writeData({ data: { showCreateResponsibility: false } });
      const { responsibilities } = cache.readQuery({
        query: GET_RESPONSIBILITIES,
        variables: { tagId: match.params.tagId },
      });

      const alreadyExists =
        responsibilities.filter(resp => resp.nodeId === createResponsibility.nodeId).length > 0;

      if (!alreadyExists) {
        cache.writeQuery({
          query: GET_RESPONSIBILITIES,
          variables: { tagId: match.params.tagId },
          data: {
            responsibilities: [createResponsibility, ...responsibilities],
          },
        });
      }
    }}
  >
    {createResponsibility => (
      <Formik
        initialValues={{ title: '' }}
        validationSchema={yup.object().shape({
          title: yup.string().required('Title is required'),
        })}
        onSubmit={(values, { resetForm }) => {
          createResponsibility({
            variables: {
              title: values.title,
              tagId: match.params.tagId,
            },
          }).then(({ data }) => {
            resetForm();
            history.push(`/${match.params.tagId}/${data.createResponsibility.nodeId}`);
          });
        }}
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <ListForm
            inputName="title"
            placeholder="Enter a title for the new note..."
            value={values.title}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </Formik>
    )}
  </Mutation>
));

CreateResponsibility.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      tagId: PropTypes.string,
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

CreateResponsibility.defaultProps = {
  match: {
    params: {
      tagId: undefined,
    },
  },
  history: {
    push: () => null,
  },
};

export default CreateResponsibility;
