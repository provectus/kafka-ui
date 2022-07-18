import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
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
  SortOrder,
  TopicColumnsToSort,
  GetTopicSchemaRequest,
  TopicMessageSchema,
} from 'generated-sources';
import {
  TopicsState,
  TopicName,
  TopicFormData,
  TopicFormFormattedParams,
  TopicFormDataRaw,
  ClusterName,
} from 'redux/interfaces';
import { getResponse } from 'lib/errorHandling';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { showSuccessAlert } from 'redux/reducers/alerts/alertsSlice';
import {
  consumerGroupsApiClient,
  messagesApiClient,
  topicsApiClient,
} from 'lib/api';

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

const formatTopicCreation = (form: TopicFormData): TopicCreation => {
  const {
    name,
    partitions,
    replicationFactor,
    cleanupPolicy,
    retentionBytes,
    retentionMs,
    maxMessageBytes,
    minInSyncReplicas,
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
      'min.insync.replicas': minInSyncReplicas.toString(),
      ...Object.values(customParams || {}).reduce(topicReducer, {}),
    },
  };
};

export const createTopic = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    data: TopicFormData;
  }
>('topic/createTopic', async (payload, { rejectWithValue }) => {
  try {
    const { data, clusterName } = payload;
    await topicsApiClient.createTopic({
      clusterName,
      topicCreation: formatTopicCreation(data),
    });

    return undefined;
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
    const consumerGroups = await consumerGroupsApiClient.getTopicConsumerGroups(
      payload
    );

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
    minInSyncReplicas,
    customParams,
  } = form;

  return {
    configs: {
      'cleanup.policy': cleanupPolicy,
      'retention.ms': retentionMs,
      'retention.bytes': retentionBytes,
      'max.message.bytes': maxMessageBytes,
      'min.insync.replicas': minInSyncReplicas,
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
>('topic/deleteTopic', async (payload, { rejectWithValue, dispatch }) => {
  try {
    const { topicName, clusterName } = payload;
    await topicsApiClient.deleteTopic(payload);
    dispatch(
      showSuccessAlert({
        id: `message-${topicName}-${clusterName}`,
        message: 'Topic successfully deleted!',
      })
    );
    return { topicName };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const recreateTopic = createAsyncThunk<
  { topic: Topic },
  RecreateTopicRequest
>('topic/recreateTopic', async (payload, { rejectWithValue, dispatch }) => {
  try {
    const { topicName, clusterName } = payload;
    const topic = await topicsApiClient.recreateTopic(payload);
    dispatch(
      showSuccessAlert({
        id: `message-${topicName}-${clusterName}`,
        message: 'Topic successfully recreated!',
      })
    );

    return { topic };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const fetchTopicMessageSchema = createAsyncThunk<
  { schema: TopicMessageSchema; topicName: TopicName },
  GetTopicSchemaRequest
>('topic/fetchTopicMessageSchema', async (payload, { rejectWithValue }) => {
  try {
    const { topicName } = payload;
    const schema = await messagesApiClient.getTopicSchema(payload);
    return { schema, topicName };
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const updateTopicPartitionsCount = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    topicName: TopicName;
    partitions: number;
  }
>(
  'topic/updateTopicPartitionsCount',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const { clusterName, topicName, partitions } = payload;

      await topicsApiClient.increaseTopicPartitions({
        clusterName,
        topicName,
        partitionsIncrease: { totalPartitionsCount: partitions },
      });
      dispatch(
        showSuccessAlert({
          id: `message-${topicName}-${clusterName}-${partitions}`,
          message: 'Number of partitions successfully increased!',
        })
      );
      dispatch(fetchTopicDetails({ clusterName, topicName }));
      return undefined;
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const updateTopicReplicationFactor = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    topicName: TopicName;
    replicationFactor: number;
  }
>(
  'topic/updateTopicReplicationFactor',
  async (payload, { rejectWithValue }) => {
    try {
      const { clusterName, topicName, replicationFactor } = payload;

      await topicsApiClient.changeReplicationFactor({
        clusterName,
        topicName,
        replicationFactorChange: { totalReplicationFactor: replicationFactor },
      });

      return undefined;
    } catch (err) {
      return rejectWithValue(await getResponse(err as Response));
    }
  }
);

export const deleteTopics = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    topicNames: TopicName[];
  }
>('topic/deleteTopics', async (payload, { rejectWithValue, dispatch }) => {
  try {
    const { clusterName, topicNames } = payload;

    topicNames.forEach((topicName) => {
      dispatch(deleteTopic({ clusterName, topicName }));
    });
    dispatch(fetchTopicsList({ clusterName }));

    return undefined;
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

export const clearTopicsMessages = createAsyncThunk<
  undefined,
  {
    clusterName: ClusterName;
    topicNames: TopicName[];
  }
>('topic/clearTopicsMessages', async (payload, { rejectWithValue }) => {
  try {
    const { clusterName, topicNames } = payload;

    topicNames.forEach((topicName) => {
      clearTopicMessages({ clusterName, topicName });
    });

    return undefined;
  } catch (err) {
    return rejectWithValue(await getResponse(err as Response));
  }
});

const initialState: TopicsState = {
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
  reducers: {
    setTopicsSearch: (state, action) => {
      state.search = action.payload;
    },
    setTopicsOrderBy: (state, action) => {
      state.sortOrder =
        state.orderBy === action.payload && state.sortOrder === SortOrder.ASC
          ? SortOrder.DESC
          : SortOrder.ASC;
      state.orderBy = action.payload;
    },
  },
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
        config: payload.topicConfig,
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
      delete state.byName[payload.topicName];
      state.allNames = state.allNames.filter(
        (name) => name !== payload.topicName
      );
    });
    builder.addCase(recreateTopic.fulfilled, (state, { payload }) => {
      state.byName = {
        ...state.byName,
        [payload.topic.name]: { ...payload.topic },
      };
    });
    builder.addCase(fetchTopicMessageSchema.fulfilled, (state, { payload }) => {
      state.byName[payload.topicName] = {
        ...state.byName[payload.topicName],
        messageSchema: payload.schema,
      };
    });
  },
});

export const { setTopicsSearch, setTopicsOrderBy } = topicsSlice.actions;

export default topicsSlice.reducer;
