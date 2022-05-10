import { v4 } from 'uuid';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  Configuration,
  TopicsApi,
  MessagesApi,
  ConsumerGroupsApi,
  TopicsResponse,
  TopicDetails,
  GetTopicsRequest,
  GetTopicDetailsRequest,
  GetTopicConfigsRequest,
  TopicConfig,
  TopicCreation,
  ConsumerGroup,
  Topic,
  TopicUpdate,
  DeleteTopicRequest,
  RecreateTopicRequest,
  CreateTopicRequest,
  SortOrder,
  TopicColumnsToSort,
} from 'generated-sources';
import {
  TopicsState,
  TopicName,
  TopicFormData,
  TopicFormFormattedParams,
  TopicFormDataRaw,
  ClusterName,
} from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import { getResponse } from 'lib/errorHandling';
import { showSuccessAlert } from 'redux/reducers/alerts/alertsSlice';

const apiClientConf = new Configuration(BASE_PARAMS);
export const topicsApiClient = new TopicsApi(apiClientConf);
export const messagesApiClient = new MessagesApi(apiClientConf);
export const topicConsumerGroupsApiClient = new ConsumerGroupsApi(
  apiClientConf
);

export const fetchTopicsList = createAsyncThunk<
  TopicsResponse,
  GetTopicsRequest
>('topic/fetchTopicsList', async (payload, { rejectWithValue }) => {
  try {
    return await topicsApiClient.getTopics(payload);
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const fetchTopicDetails = createAsyncThunk<
  { topicDetails: TopicDetails; topicName: TopicName },
  GetTopicDetailsRequest
>('topic/fetchTopicDetails', async (payload, { rejectWithValue }) => {
  try {
    const { topicName } = payload;
    const topicDetails = await topicsApiClient.getTopicDetails(payload);

    return { topicDetails, topicName };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const fetchTopicConfig = createAsyncThunk<
  { topicConfig: TopicConfig[]; topicName: TopicName },
  GetTopicConfigsRequest
>('topic/fetchTopicConfig', async (payload, { rejectWithValue }) => {
  try {
    const { topicName } = payload;
    const topicConfig = await topicsApiClient.getTopicConfigs(payload);

    return { topicConfig, topicName };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

const topicReducer = (
  result: TopicFormFormattedParams,
  customParam: TopicConfig
) => {
  return {
    ...result,
    [customParam.name]: customParam.value,
  };
};

export const formatTopicCreation = (form: TopicFormData): TopicCreation => {
  const {
    name,
    partitions,
    replicationFactor,
    cleanupPolicy,
    retentionBytes,
    retentionMs,
    maxMessageBytes,
    minInsyncReplicas,
    customParams,
  } = form;

  return {
    name,
    partitions,
    replicationFactor,
    configs: {
      'cleanup.policy': cleanupPolicy,
      'retention.ms': retentionMs.toString(),
      'retention.bytes': retentionBytes.toString(),
      'max.message.bytes': maxMessageBytes.toString(),
      'min.insync.replicas': minInsyncReplicas.toString(),
      ...Object.values(customParams || {}).reduce(topicReducer, {}),
    },
  };
};

// is not completed
export const createTopic = createAsyncThunk<
  { topic: Topic },
  {
    clusterName: ClusterName;
    data: TopicFormData;
  }
>('topic/createTopic', async ({ clusterName, data }, { rejectWithValue }) => {
  try {
    const topic = await topicsApiClient.createTopic({
      clusterName,
      topicCreation: formatTopicCreation(data),
    });
    return { topic };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const fetchTopicConsumerGroups = createAsyncThunk<
  { consumerGroups: ConsumerGroup[]; topicName: TopicName },
  GetTopicConfigsRequest
>('topic/fetchTopicConsumerGroups', async (payload, { rejectWithValue }) => {
  try {
    const { topicName } = payload;
    const consumerGroups =
      await topicConsumerGroupsApiClient.getTopicConsumerGroups(payload);

    return { consumerGroups, topicName };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

const formatTopicUpdate = (form: TopicFormDataRaw): TopicUpdate => {
  const {
    cleanupPolicy,
    retentionBytes,
    retentionMs,
    maxMessageBytes,
    minInsyncReplicas,
    customParams,
  } = form;

  return {
    configs: {
      'cleanup.policy': cleanupPolicy,
      'retention.ms': retentionMs,
      'retention.bytes': retentionBytes,
      'max.message.bytes': maxMessageBytes,
      'min.insync.replicas': minInsyncReplicas,
      ...Object.values(customParams || {}).reduce(topicReducer, {}),
    },
  };
};

export const updateTopic = createAsyncThunk<
  { topic: Topic },
  {
    clusterName: ClusterName;
    topicName: TopicName;
    form: TopicFormDataRaw;
  }
>(
  'topic/updateTopic',
  async ({ clusterName, topicName, form }, { rejectWithValue }) => {
    try {
      const topic = await topicsApiClient.updateTopic({
        clusterName,
        topicName,
        topicUpdate: formatTopicUpdate(form),
      });

      return { topic };
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const deleteTopic = createAsyncThunk<
  { topicName: TopicName },
  DeleteTopicRequest
>('topic/deleteTopic', async (payload, { rejectWithValue }) => {
  try {
    const { topicName } = payload;
    await topicsApiClient.deleteTopic(payload);

    return { topicName };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const recreateTopic = createAsyncThunk<
  { topic: Topic },
  RecreateTopicRequest
>('topic/recreateTopic', async (payload, { rejectWithValue }) => {
  try {
    const topic = await topicsApiClient.recreateTopic(payload);
    return { topic };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
  totalPages: 1,
  search: '',
  orderBy: TopicColumnsToSort.NAME,
  sortOrder: SortOrder.ASC,
  consumerGroups: [],
};

const topicsSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTopicsList.fulfilled, (state, { payload }) => {
      if (payload.topics) {
        state.allNames = [];
        state.totalPages = payload.pageCount || 1;

        payload.topics.forEach((topic) => {
          state.allNames.push(topic.name);
          state.byName[topic.name] = {
            ...state.byName[topic.name],
            ...topic,
            id: v4(),
          };
        });
      }
    });
    builder.addCase(fetchTopicDetails.fulfilled, (state, { payload }) => {
      state.byName[payload.topicName] = {
        ...state.byName[payload.topicName],
        ...payload.topicDetails,
      };
    });
    builder.addCase(fetchTopicConfig.fulfilled, (state, { payload }) => {
      state.byName[payload.topicName] = {
        ...state.byName[payload.topicName],
        config: payload.topicConfig.map((config) => ({ ...config })),
      };
    });
    builder.addCase(
      fetchTopicConsumerGroups.fulfilled,
      (state, { payload }) => {
        state.byName[payload.topicName] = {
          ...state.byName[payload.topicName],
          ...payload.consumerGroups,
        };
      }
    );
    builder.addCase(updateTopic.fulfilled, (state, { payload }) => {
      state.byName[payload.topic.name] = {
        ...state.byName[payload.topic.name],
        ...payload.topic,
      };
    });
    builder.addCase(deleteTopic.fulfilled, (state, { payload }) => {
      state.allNames = state.allNames.filter(
        (name) => name !== payload.topicName
      );
      delete state.byName[payload.topicName];
    });
    builder.addCase(recreateTopic.fulfilled, (state, { payload }) => {
      state.byName = {
        ...state.byName,
        [payload.topic.name]: { ...payload.topic },
      };
    });
  },
});

export default topicsSlice.reducer;
