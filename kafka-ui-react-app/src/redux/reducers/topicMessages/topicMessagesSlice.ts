import { createSlice } from '@reduxjs/toolkit';
import { TopicMessagesState } from 'redux/interfaces';
import { TopicMessage } from 'generated-sources';

export const initialState: TopicMessagesState = {
  messages: [],
  meta: {
    bytesConsumed: 0,
    elapsedMs: 0,
    messagesConsumed: 0,
    isCancelled: false,
  },
  messageEventType: '',
  isFetching: false,
};

const topicMessagesSlice = createSlice({
  name: 'topicMessages',
  initialState,
  reducers: {
    addTopicMessage: (state, action) => {
      const messages: TopicMessage[] = action.payload.prepend
        ? [action.payload.message, ...state.messages]
        : [...state.messages, action.payload.message];

      return {
        ...state,
        messages,
      };
    },
    resetTopicMessages: () => initialState,
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
  },
});

export const {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesPhase,
  updateTopicMessagesMeta,
  setTopicMessagesFetchingStatus,
  setMessageEventType,
} = topicMessagesSlice.actions;

export default topicMessagesSlice.reducer;
