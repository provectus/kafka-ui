import { createSelector } from 'reselect';
import { RootState, TopicMessagesState } from 'redux/interfaces';

const topicMessagesState = ({ topicMessages }: RootState): TopicMessagesState =>
  topicMessages;

export const getTopicMessges = createSelector(
  topicMessagesState,
  ({ messages }) => messages
);

export const getTopicMessgesPhase = createSelector(
  topicMessagesState,
  ({ phase }) => phase
);

export const getTopicMessgesMeta = createSelector(
  topicMessagesState,
  ({ meta }) => meta
);
