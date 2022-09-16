import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  GetSerdesRequest,
  TopicMessage,
  TopicSerdeSuggestion,
} from 'generated-sources';
import { messagesApiClient } from 'lib/api';
import {
  getResponse,
  showServerError,
  showSuccessAlert,
} from 'lib/errorHandling';
import { ClusterName, TopicMessagesState, TopicName } from 'redux/interfaces';

export const clearTopicMessages = createAsyncThunk<
  undefined,
  { clusterName: ClusterName; topicName: TopicName; partitions?: number[] }
>(
  'topicMessages/clearTopicMessages',
  async ({ clusterName, topicName, partitions }, { rejectWithValue }) => {
    try {
      await messagesApiClient.deleteTopicMessages({
        clusterName,
        topicName,
        partitions,
      });
      showSuccessAlert({
        id: `message-${topicName}-${clusterName}-${partitions}`,
        message: `${topicName} messages have been successfully cleared!`,
      });
      return undefined;
    } catch (err) {
      showServerError(err as Response);
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const initialState: TopicMessagesState = {
  messages: [],
  meta: {
    bytesConsumed: 0,
    elapsedMs: 0,
    messagesConsumed: 0,
    isCancelled: false,
  },
  serdes: {},
  isFetching: false,
};

export const fetchTopicSerdes = createAsyncThunk<
  { topicSerdes: TopicSerdeSuggestion; topicName: TopicName },
  GetSerdesRequest
>('topic/fetchTopicSerdes', async (payload, { rejectWithValue }) => {
  try {
    const { topicName } = payload;
    const topicSerdes = await messagesApiClient.getSerdes(payload);

    return { topicSerdes, topicName };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

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
    setTopicSerdes: (state, action) => {
      if (action?.payload?.payload?.topicSerdes) {
        state.serdes = action.payload.payload.topicSerdes;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearTopicMessages.fulfilled, (state) => {
      state.messages = [];
    });
    builder.addCase(fetchTopicSerdes.fulfilled, (state, { payload }) => {
      if (payload?.topicSerdes) {
        state.serdes = payload.topicSerdes;
      }
    });
  },
});

export const {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesPhase,
  updateTopicMessagesMeta,
  setTopicMessagesFetchingStatus,
  setTopicSerdes,
} = topicMessagesSlice.actions;

export default topicMessagesSlice.reducer;
