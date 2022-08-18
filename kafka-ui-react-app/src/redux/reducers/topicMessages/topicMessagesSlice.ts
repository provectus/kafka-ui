import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TopicMessagesState, ClusterName, TopicName } from 'redux/interfaces';
import {
  GetSerdesRequest,
  SerdeUsage,
  TopicMessage,
  TopicSerdeSuggestion,
} from 'generated-sources';
import { getResponse } from 'lib/errorHandling';
import { showSuccessAlert } from 'redux/reducers/alerts/alertsSlice';
import { fetchTopicDetails } from 'redux/reducers/topics/topicsSlice';
import { messagesApiClient } from 'lib/api';

export const clearTopicMessages = createAsyncThunk<
  undefined,
  { clusterName: ClusterName; topicName: TopicName; partitions?: number[] }
>(
  'topicMessages/clearTopicMessages',
  async (
    { clusterName, topicName, partitions },
    { rejectWithValue, dispatch }
  ) => {
    try {
      await messagesApiClient.deleteTopicMessages({
        clusterName,
        topicName,
        partitions,
      });
      dispatch(fetchTopicDetails({ clusterName, topicName }));
      dispatch(
        showSuccessAlert({
          id: `message-${topicName}-${clusterName}-${partitions}`,
          message: 'Messages successfully cleared!',
        })
      );

      return undefined;
    } catch (err) {
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

export const topicMessagesSlice = createSlice({
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
  },
});

export const fetchTopicSerdes = createAsyncThunk<
  { topicSerdes: TopicSerdeSuggestion; topicName: TopicName },
  GetSerdesRequest
>('topic/fetchTopicSerdes', async (payload, { rejectWithValue }) => {
  try {
    const { topicName } = payload;
    payload.use = SerdeUsage.SERIALIZE;
    const topicSerdes = await messagesApiClient.getSerdes(payload);

    return { topicSerdes, topicName };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
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
