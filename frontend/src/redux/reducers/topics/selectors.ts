import { createSelector } from 'reselect';
import { TopicsState, RootState, Topic, TopicName, FetchStatus } from 'types';

const topicsState = ({ topics }: RootState): TopicsState => topics;

export const getIsTopicListFetched = createSelector(topicsState, ({ fetchStatus }) => fetchStatus === FetchStatus.fetched);

export const getTopicList = createSelector(topicsState, ({ items }) => items);

export const getTotalBrokers = createSelector(
  topicsState,
  ({ brokers }) => (brokers !== undefined ? brokers.length : undefined),
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
