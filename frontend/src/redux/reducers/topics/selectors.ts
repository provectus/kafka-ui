import { createSelector } from 'reselect';
import { RootState, TopicName, FetchStatus, TopicsState } from 'types';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const topicsState = ({ topics }: RootState): TopicsState => topics;

const getAllNames = (state: RootState) => topicsState(state).allNames;
const getTopicMap = (state: RootState) => topicsState(state).byName;

const getTopicListFetchingStatus = createFetchingSelector('GET_TOPICS');
const getTopicDetailsFetchingStatus = createFetchingSelector('GET_TOPIC_DETAILS');
const getTopicConfigFetchingStatus = createFetchingSelector('GET_TOPIC_CONFIG');

export const getIsTopicListFetched = createSelector(
  getTopicListFetchingStatus,
  (status) => status === FetchStatus.fetched,
);

export const getIsTopicDetailsFetched = createSelector(
  getTopicDetailsFetchingStatus,
  (status) => status === FetchStatus.fetched,
);

export const getTopicConfigFetched = createSelector(
  getTopicConfigFetchingStatus,
  (status) => status === FetchStatus.fetched,
);

export const getTopicList = createSelector(
  getIsTopicListFetched,
  getAllNames,
  getTopicMap,
  (isFetched, allNames, byName) => {
    if (isFetched) {
      return allNames.map((name) => byName[name])
    }

    return [];
  },
);

export const getExternalTopicList = createSelector(
  getTopicList,
  (topics) => topics.filter(({ internal }) => !internal),
);

const getTopicName = (_: RootState, topicName: TopicName) => topicName;

export const getTopicByName = createSelector(
  getTopicMap,
  getTopicName,
  (topics, topicName) => topics[topicName],
);

export const getTopicConfig = createSelector(getTopicByName, ({ config }) => config);
