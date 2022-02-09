import { createSelector } from '@reduxjs/toolkit';
import {
  RootState,
  TopicName,
  TopicsState,
  TopicConfigByName,
} from 'redux/interfaces';
import { CleanUpPolicy } from 'generated-sources';
import { createLeagcyFetchingSelector } from 'redux/reducers/loader/selectors';

const topicsState = ({ topics }: RootState): TopicsState => topics;

const getAllNames = (state: RootState) => topicsState(state).allNames;
const getTopicMap = (state: RootState) => topicsState(state).byName;

export const getTopicListTotalPages = (state: RootState) =>
  topicsState(state).totalPages;

const getTopicListFetchingStatus = createLeagcyFetchingSelector('GET_TOPICS');
const getTopicDetailsFetchingStatus =
  createLeagcyFetchingSelector('GET_TOPIC_DETAILS');

const getTopicConfigFetchingStatus =
  createLeagcyFetchingSelector('GET_TOPIC_CONFIG');
const getTopicCreationStatus = createLeagcyFetchingSelector('POST_TOPIC');
const getTopicUpdateStatus = createLeagcyFetchingSelector('PATCH_TOPIC');
const getTopicMessageSchemaFetchingStatus =
  createLeagcyFetchingSelector('GET_TOPIC_SCHEMA');
const getPartitionsCountIncreaseStatus =
  createLeagcyFetchingSelector('UPDATE_PARTITIONS');
const getReplicationFactorUpdateStatus = createLeagcyFetchingSelector(
  'UPDATE_REPLICATION_FACTOR'
);
const getTopicDeletingStatus = createLeagcyFetchingSelector('DELETE_TOPIC');

export const getIsTopicDeleted = createSelector(
  getTopicDeletingStatus,
  (status) => status === 'fetched'
);

export const getAreTopicsFetching = createSelector(
  getTopicListFetchingStatus,
  (status) => status === 'fetching' || status === 'notFetched'
);

export const getAreTopicsFetched = createSelector(
  getTopicListFetchingStatus,
  (status) => status === 'fetched'
);

export const getIsTopicDetailsFetching = createSelector(
  getTopicDetailsFetchingStatus,
  (status) => status === 'notFetched' || status === 'fetching'
);

export const getIsTopicDetailsFetched = createSelector(
  getTopicDetailsFetchingStatus,
  (status) => status === 'fetched'
);

export const getTopicConfigFetched = createSelector(
  getTopicConfigFetchingStatus,
  (status) => status === 'fetched'
);

export const getTopicCreated = createSelector(
  getTopicCreationStatus,
  (status) => status === 'fetched'
);

export const getTopicUpdated = createSelector(
  getTopicUpdateStatus,
  (status) => status === 'fetched'
);

export const getTopicMessageSchemaFetched = createSelector(
  getTopicMessageSchemaFetchingStatus,
  (status) => status === 'fetched'
);

export const getTopicPartitionsCountIncreased = createSelector(
  getPartitionsCountIncreaseStatus,
  (status) => status === 'fetched'
);

export const getTopicReplicationFactorUpdated = createSelector(
  getReplicationFactorUpdateStatus,
  (status) => status === 'fetched'
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
  (topics, topicName) => topics[topicName]
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

export const getTopicConfigByParamName = createSelector(
  getTopicConfig,
  (config) => {
    const byParamName: TopicConfigByName = {
      byName: {},
    };

    if (config) {
      config.forEach((param) => {
        byParamName.byName[param.name] = param;
      });
    }

    return byParamName;
  }
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
  getTopicMap,
  getTopicName,
  (topics, topicName) => topics[topicName].consumerGroups || []
);

export const getMessageSchemaByTopicName = createSelector(
  getTopicByName,
  (topic) => topic.messageSchema
);
