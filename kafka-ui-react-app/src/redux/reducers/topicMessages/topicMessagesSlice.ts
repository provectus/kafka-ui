import { createSlice } from '@reduxjs/toolkit';
import { TopicMessagesState } from 'redux/interfaces';
import { TopicMessage } from 'generated-sources';

const PER_PAGE = 100;

export const initialState: TopicMessagesState = {
  allMessages: [],
  messages: [],
  meta: {
    bytesConsumed: 0,
    elapsedMs: 0,
    messagesConsumed: 0,
    isCancelled: false,
  },
  messageEventType: '',
  isFetching: false,
  currentPage: 0,
  lastLoadedPage: 0,
};

const topicMessagesSlice = createSlice({
  name: 'topicMessages',
  initialState,
  reducers: {
    addTopicMessage: (state, action) => {
      const allmessages: TopicMessage[] = action.payload.prepend
        ? [action.payload.message, ...state.allMessages]
        : [...state.allMessages, action.payload.message];

      const messages: TopicMessage[] = action.payload.prepend
        ? [action.payload.message, ...state.messages]
        : [...state.messages, action.payload.message];

      return {
        ...state,
        allMessages: allmessages,
        messages,
      };
    },
    resetTopicMessages: (state) => {
      return {
        ...initialState,
        currentPage: state.currentPage,
        allMessages: state.allMessages,
      };
    },
    resetAllTopicMessages: () => initialState,
    updateTopicMessagesPhase: (state, action) => {
      state.phase = action.payload;
    },
    updateTopicMessagesMeta: (state, action) => {
      state.meta = action.payload;
    },
    setTopicMessagesFetchingStatus: (state, action) => {
      state.isFetching = action.payload;
    },

    setMessageEventType: (state, action) => {
      state.messageEventType = action.payload;
    },
    updateTopicMessagesCursor: (state, action) => {
      state.cursor = action.payload;
    },
    setTopicMessagesCurrentPage: (state, action) => {
      if (state.currentPage !== action.payload) {
        const messages: TopicMessage[] = state.allMessages.slice(
          (action.payload - 1) * PER_PAGE,
          (action.payload - 1) * PER_PAGE + PER_PAGE
        );
        return {
          ...state,
          currentPage: action.payload,
          messages,
        };
      }
      return {
        ...state,
      };
    },
    setTopicMessagesLastLoadedPage: (state, action) => {
      state.lastLoadedPage = action.payload;
    },
  },
});

export const {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesPhase,
  updateTopicMessagesMeta,
  setTopicMessagesFetchingStatus,
  setMessageEventType,
  updateTopicMessagesCursor,
  setTopicMessagesCurrentPage,
  setTopicMessagesLastLoadedPage,
  resetAllTopicMessages,
} = topicMessagesSlice.actions;

export default topicMessagesSlice.reducer;
