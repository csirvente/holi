import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { FormGroup, Label, Form, Button } from 'reactstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { withRouter } from 'react-router-dom';
import ContentForm from '@/components/ContentForm';
import { FaChainBroken } from 'react-icons/lib/fa';

const ADD_GRAPHTAG_IS_LINKED = gql`
  mutation AddGraphTagIsLinked_addIsLinkedMutation(
    $from: _GraphTagInput!
    $to: _ContentInput!
  ) {
    addGraphTagIsLinked(from: $from, to: $to) {
      from {
        nodeId
        contentLinks {
          nodeId
          url
          title
        }
      }
    }
  }
`;

const InvalidUrlText = styled.span`
  color: #ff0000;
  font-weight: bold;
`;
const InvalidTitleText = styled.span`
  color: #ff0000;
  font-weight: bold;
`;

const AddLink = withRouter(({ nodeId }) => (
  <Mutation mutation={ADD_GRAPHTAG_IS_LINKED}>
    {createLink => (
      <FormGroup>
        <Formik
          initialValues={{ url: '', title: '' }}
          validationSchema={yup.object().shape({
            url: yup
              .string()
              .required('URL is required')
              .url('Invalid URL'),
            title: yup
              .string()
              .required('Title is required'),
          })}
          onSubmit={(values, { resetForm }) => {
            createLink({
              variables: { from: { nodeId }, to: { url: values.url, title: values.title } },
            }).then(() => {
              resetForm();
            });
          }}
        >
          {({
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            errors,
            touched,
          }) => (
            <Form onSubmit={handleSubmit}>
              <div>
                <Label for="editLinkUrl">
                  Add a link{' '}
                  {touched.url && errors.url && (
                    <InvalidUrlText>
                      <FaChainBroken /> {errors.url}
                    </InvalidUrlText>
                  )}
                </Label>
                <ContentForm
                  inputName="url"
                  placeholder="Enter an URL..."
                  value={values.url}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
                <Label for="editLinkTitle">
                  Add a title to your link{' '}
                  {touched.title && errors.title && (
                    <InvalidTitleText>
                      <FaChainBroken /> {errors.title}
                    </InvalidTitleText>
                  )}
                </Label>
                <ContentForm
                  inputName="title"
                  placeholder="Title for your link..."
                  value={values.title}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  handleBlur={handleBlur}
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                >
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </FormGroup>
    )}
  </Mutation>
));

AddLink.propTypes = {
  nodeId: PropTypes.string,
};

AddLink.defaultProps = {
  nodeId: '',
};

export default AddLink;
