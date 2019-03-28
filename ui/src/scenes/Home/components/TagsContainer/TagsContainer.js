import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import _ from 'lodash';
import { withRouter, Redirect } from 'react-router-dom';
import { Query } from 'react-apollo';
import { GET_TAGS } from '@/services/queries';
import {
  REALITIES_CREATE_SUBSCRIPTION,
  REALITIES_DELETE_SUBSCRIPTION,
  REALITIES_UPDATE_SUBSCRIPTION,
} from '@/services/subscriptions';
import withAuth from '@/components/withAuth';
import ListHeader from '@/components/ListHeader';
import colors from '@/styles/colors';
import WrappedLoader from '@/components/WrappedLoader';
import CreateTag from './components/CreateTag';
import TagsList from './components/TagsList';

const GET_SHOW_CREATE_TAG = gql`
  query TagsContainer_showCreateTag {
    showCreateTag @client
  }
`;

const TagsContainer = withAuth(withRouter(({ auth, match }) => (
  <Query query={GET_SHOW_CREATE_TAG}>
    {({ data: localData, client }) => (
      <div>
        <ListHeader
          text="Pin new cool links"
          color={colors.tag}
          showButton={auth.isLoggedIn}
          onButtonClick={() =>
              client.writeData({
                data: {
                  showCreateTag: !localData.showCreateTag,
                  showCreateResponsibility: false,
                },
              })
            }
        />
        {localData.showCreateTag && <CreateTag />}
        <Query query={GET_TAGS}>
          {({
 subscribeToMore, loading, error, data,
}) => {
              if (loading) return <WrappedLoader />;
              if (error) return `Error! ${error.message}`;

              const firstTagId =
                data.tags && data.tags[0] && data.tags[0].nodeId;
              if (
                !_.find(data.tags, { nodeId: match.params.tagId }) &&
                firstTagId
              ) {
                return <Redirect to={`/${firstTagId}`} />;
              }

              return (
                <TagsList
                  tags={data.tags}
                  selectedTagId={match.params.tagId}
                  subscribeToTagsEvents={() => {
                    subscribeToMore({
                      document: REALITIES_CREATE_SUBSCRIPTION,
                      updateQuery: (prev, { subscriptionData }) => {
                        if (!subscriptionData.data) return prev;
                        const { realityCreated } = subscriptionData.data;

                        if (realityCreated.__typename !== 'Tag') return prev;

                        const alreadyExists =
  prev.tags.filter(tag => tag.nodeId === realityCreated.nodeId).length > 0;

                        if (alreadyExists) return prev;
                        return { tags: [realityCreated, ...prev.tags] };
                      },
                    });
                    subscribeToMore({
                      document: REALITIES_DELETE_SUBSCRIPTION,
                      updateQuery: (prev, { subscriptionData }) => {
                        if (!subscriptionData.data) return prev;
                        const { realityDeleted } = subscriptionData.data;
                        return {
                          tags: prev.tags.filter(item => item.nodeId !== realityDeleted.nodeId),
                        };
                      },
                    });
                    subscribeToMore({
                      document: REALITIES_UPDATE_SUBSCRIPTION,
                      updateQuery: (prev, { subscriptionData }) => {
                        if (!subscriptionData.data) return prev;

                        const { realityUpdated } = subscriptionData.data;

                        return {
                          tags: prev.tags.map((item) => {
                            if (item.nodeId === realityUpdated.nodeId) { return realityUpdated; }
                            return item;
                          }),
                        };
                      },
                    });
                  }}
                />
              );
            }}
        </Query>
      </div>
      )}
  </Query>
)));

TagsContainer.propTypes = {
  auth: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      tagId: PropTypes.string,
    }),
  }),
};

TagsContainer.defaultProps = {
  auth: {
    isLoggedIn: false,
  },
  match: {
    params: {
      tagId: undefined,
    },
  },
};

export default TagsContainer;
