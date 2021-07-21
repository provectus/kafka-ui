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

export const getTopicMessgesBytesConsumed = createSelector(
  getTopicMessgesMeta,
  ({ bytesConsumed }) => bytesConsumed
);

export const getTopicMessgesElapsedMs = createSelector(
  getTopicMessgesMeta,
  ({ elapsedMs }) => elapsedMs
);

export const getTopicMessgesMessagesConsumed = createSelector(
  getTopicMessgesMeta,
  ({ messagesConsumed }) => messagesConsumed
);

export const getTopicMessgesIsCancelled = createSelector(
  getTopicMessgesMeta,
  ({ isCancelled }) => isCancelled
);
