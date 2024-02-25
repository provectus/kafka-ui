import { createSelector } from '@reduxjs/toolkit';
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

export const getTopicMessgesCursor = createSelector(
  topicMessagesState,
  ({ cursor }) => cursor
);

export const getTopicMessgesCurrentPage = createSelector(
  topicMessagesState,
  ({ currentPage }) => currentPage
);

export const getTopicMessgesLastLoadedPage = createSelector(
  topicMessagesState,
  ({ lastLoadedPage }) => lastLoadedPage
);

export const getIsTopicMessagesFetching = createSelector(
  topicMessagesState,
  ({ isFetching }) => isFetching
);

export const getIsTopicMessagesType = createSelector(
  topicMessagesState,
  ({ messageEventType }) => messageEventType
);
