import { createSelector } from '@reduxjs/toolkit';
import { RootState, TopicName, TopicsState } from 'redux/interfaces';
import { CleanUpPolicy } from 'generated-sources';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import {
  fetchTopicsList,
  fetchTopicDetails,
  fetchTopicConfig,
  updateTopic,
  fetchTopicMessageSchema,
  fetchTopicConsumerGroups,
  createTopic,
  deleteTopic,
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
} from 'redux/reducers/topics/topicsSlice';
import { AsyncRequestStatus } from 'lib/constants';

const topicsState = ({ topics }: RootState): TopicsState => topics;

const getAllNames = (state: RootState) => topicsState(state).allNames;
const getTopicMap = (state: RootState) => topicsState(state).byName;

export const getTopicListTotalPages = (state: RootState) =>
  topicsState(state).totalPages;

const getTopicDeletingStatus = createFetchingSelector(deleteTopic.typePrefix);

export const getIsTopicDeleted = createSelector(
  getTopicDeletingStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

const getAreTopicsFetchingStatus = createFetchingSelector(
  fetchTopicsList.typePrefix
);

export const getAreTopicsFetching = createSelector(
  getAreTopicsFetchingStatus,
  (status) => status === AsyncRequestStatus.pending
);
export const getAreTopicsFetched = createSelector(
  getAreTopicsFetchingStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

const getTopicDetailsFetchingStatus = createFetchingSelector(
  fetchTopicDetails.typePrefix
);

export const getIsTopicDetailsFetching = createSelector(
  getTopicDetailsFetchingStatus,
  (status) => status === AsyncRequestStatus.pending
);

export const getIsTopicDetailsFetched = createSelector(
  getTopicDetailsFetchingStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

const getTopicConfigFetchingStatus = createFetchingSelector(
  fetchTopicConfig.typePrefix
);

export const getTopicConfigFetched = createSelector(
  getTopicConfigFetchingStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

const getTopicCreationStatus = createFetchingSelector(createTopic.typePrefix);

export const getTopicCreated = createSelector(
  getTopicCreationStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

const getTopicUpdateStatus = createFetchingSelector(updateTopic.typePrefix);

export const getTopicUpdated = createSelector(
  getTopicUpdateStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

const getTopicMessageSchemaFetchingStatus = createFetchingSelector(
  fetchTopicMessageSchema.typePrefix
);

export const getTopicMessageSchemaFetched = createSelector(
  getTopicMessageSchemaFetchingStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

const getPartitionsCountIncreaseStatus = createFetchingSelector(
  updateTopicPartitionsCount.typePrefix
);

export const getTopicPartitionsCountIncreased = createSelector(
  getPartitionsCountIncreaseStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

const getReplicationFactorUpdateStatus = createFetchingSelector(
  updateTopicReplicationFactor.typePrefix
);

export const getTopicReplicationFactorUpdated = createSelector(
  getReplicationFactorUpdateStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

const getTopicConsumerGroupsStatus = createFetchingSelector(
  fetchTopicConsumerGroups.typePrefix
);

export const getTopicsConsumerGroupsFetched = createSelector(
  getTopicConsumerGroupsStatus,
  (status) => status === AsyncRequestStatus.fulfilled
);

export const getTopicList = createSelector(
  getAreTopicsFetched,
  getAllNames,
  getTopicMap,
  (isFetched, allNames, byName) => {
    if (!isFetched) {
      return [];
    }
    return allNames.map((name) => byName[name]);
  }
);

const getTopicName = (_: RootState, topicName: TopicName) => topicName;

export const getTopicByName = createSelector(
  getTopicMap,
  getTopicName,
  (topics, topicName) => topics[topicName] || {}
);

export const getPartitionsByTopicName = createSelector(
  getTopicMap,
  getTopicName,
  (topics, topicName) => topics[topicName]?.partitions || []
);

export const getFullTopic = createSelector(getTopicByName, (topic) =>
  topic && topic.config && !!topic.partitionCount ? topic : undefined
);

export const getTopicConfig = createSelector(
  getTopicByName,
  ({ config }) => config
);

export const getIsTopicDeletePolicy = createSelector(
  getTopicByName,
  (topic) => {
    return topic?.cleanUpPolicy === CleanUpPolicy.DELETE;
  }
);

export const getTopicsSearch = createSelector(
  topicsState,
  (state) => state.search
);

export const getTopicsOrderBy = createSelector(
  topicsState,
  (state) => state.orderBy
);

export const getTopicsSortOrder = createSelector(
  topicsState,
  (state) => state.sortOrder
);

export const getIsTopicInternal = createSelector(
  getTopicByName,
  (topic) => !!topic?.internal
);

export const getTopicConsumerGroups = createSelector(
  getTopicByName,
  ({ consumerGroups }) => consumerGroups || []
);

export const getMessageSchemaByTopicName = createSelector(
  getTopicByName,
  (topic) => topic?.messageSchema
);
