import { createSelector } from 'reselect';
import {
  RootState,
  TopicName,
  TopicsState,
  TopicConfigByName,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { Partition } from 'generated-sources';

const topicsState = ({ topics }: RootState): TopicsState => topics;

const getAllNames = (state: RootState) => topicsState(state).allNames;
const getTopicMap = (state: RootState) => topicsState(state).byName;
export const getTopicMessages = (state: RootState) =>
  topicsState(state).messages;
export const getTopicListTotalPages = (state: RootState) =>
  topicsState(state).totalPages;
export const getTopicConsumerGroups = (state: RootState) =>
  topicsState(state).consumerGroups;

const getTopicListFetchingStatus = createFetchingSelector('GET_TOPICS');
const getTopicDetailsFetchingStatus =
  createFetchingSelector('GET_TOPIC_DETAILS');
const getTopicMessagesFetchingStatus =
  createFetchingSelector('GET_TOPIC_MESSAGES');
const getTopicConfigFetchingStatus = createFetchingSelector('GET_TOPIC_CONFIG');
const getTopicCreationStatus = createFetchingSelector('POST_TOPIC');
const getTopicUpdateStatus = createFetchingSelector('PATCH_TOPIC');

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

export const getIsTopicMessagesFetched = createSelector(
  getTopicMessagesFetchingStatus,
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

export const getExternalTopicList = createSelector(getTopicList, (topics) =>
  topics.filter(({ internal }) => !internal)
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
  (topics, topicName) => topics[topicName].partitions as Partition[]
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

export const getTopicsSearch = createSelector(
  topicsState,
  (state) => state.search
);

export const getTopicsOrderBy = createSelector(
  topicsState,
  (state) => state.orderBy
);

export const getIsTopicInternal = createSelector(
  getTopicByName,
  ({ internal }) => !!internal
);
