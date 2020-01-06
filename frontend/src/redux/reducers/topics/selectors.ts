import { createSelector } from 'reselect';
import { RootState, Topic, TopicName, FetchStatus } from 'types';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const topicsState = ({ topics }: RootState): Topic[] => topics;

const getTopicListFetchingStatus = createFetchingSelector('GET_TOPICS');

export const getIsTopicListFetched = createSelector(
  getTopicListFetchingStatus,
  (status) => status === FetchStatus.fetched,
);

export const getTopicList = createSelector(
  getIsTopicListFetched,
  topicsState,
  (isFetched, topics) => isFetched ? topics : [],
);

export const getExternalTopicList = createSelector(
  getTopicList,
  (topics) => topics.filter(({ internal }) => !internal),
);

interface TopicMap {[key: string]: Topic};

export const getTopicMap = createSelector(
  getTopicList,
  (topics) => topics.reduce<TopicMap>(
    (memo: TopicMap, topic: Topic): TopicMap => ({
      ...memo,
      [topic.name]: { ...topic },
    }),
    {},
  )
);

const getTopicName = (_: RootState, topicName: TopicName) => topicName;

export const getTopicByName = createSelector(
  getTopicMap,
  getTopicName,
  (topics: TopicMap, topicName: TopicName) => topics[topicName],
);
