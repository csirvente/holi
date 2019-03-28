import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import * as yup from 'yup';
import { withRouter } from 'react-router-dom';
import { Mutation } from 'react-apollo';
import { Formik } from 'formik';
import { GET_TAGS } from '@/services/queries';
import ListForm from '@/components/ListForm';

const CREATE_TAG = gql`
  mutation CreateTag_createTagMutation($title: String!) {
    createTag(title: $title) {
      nodeId
      title
      fulfilledBy {
        nodeId
        title
        realizer {
          nodeId
          name
        }
      }
    }
  }
`;

const CreateTag = withRouter(({ history }) => (
  <Mutation
    mutation={CREATE_TAG}
    update={(cache, { data: { createTag } }) => {
      cache.writeData({ data: { showCreateTag: false } });
      const { tags } = cache.readQuery({ query: GET_TAGS });

      const alreadyExists = tags.filter(tag => tag.nodeId === createTag.nodeId).length > 0;
      if (!alreadyExists) {
        cache.writeQuery({
          query: GET_TAGS,
          data: { tags: [createTag, ...tags] },
        });
      }
    }}
  >
    {createTag => (
      <Formik
        initialValues={{ title: '' }}
        validationSchema={yup.object().shape({
          title: yup.string().required('Title is required'),
        })}
        onSubmit={(values, { resetForm }) => {
          createTag({ variables: { title: values.title } }).then(({ data }) => {
            resetForm();
            history.push(`/${data.createTag.nodeId}`);
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
            placeholder="Enter a title for the new tag..."
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

CreateTag.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

CreateTag.defaultProps = {
  history: {
    push: () => null,
  },
};

export default CreateTag;
