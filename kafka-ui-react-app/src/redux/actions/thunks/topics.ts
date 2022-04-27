import { v4 } from 'uuid';
import {
  TopicsApi,
  MessagesApi,
  Configuration,
  Topic,
  TopicCreation,
  TopicUpdate,
  TopicConfig,
  ConsumerGroupsApi,
  GetTopicsRequest,
} from 'generated-sources';
import {
  PromiseThunkResult,
  ClusterName,
  TopicName,
  TopicFormFormattedParams,
  TopicFormDataRaw,
  TopicsState,
  FailurePayload,
  TopicFormData,
  AppDispatch,
} from 'redux/interfaces';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { BASE_PARAMS } from 'lib/constants';
import * as actions from 'redux/actions/actions';
import { getResponse } from 'lib/errorHandling';
import { showSuccessAlert } from 'redux/reducers/alerts/alertsSlice';

const apiClientConf = new Configuration(BASE_PARAMS);
export const topicsApiClient = new TopicsApi(apiClientConf);
export const messagesApiClient = new MessagesApi(apiClientConf);
export const topicConsumerGroupsApiClient = new ConsumerGroupsApi(
  apiClientConf
);

export const fetchTopicsList =
  (params: GetTopicsRequest): PromiseThunkResult =>
  async (dispatch, getState) => {
    dispatch(actions.fetchTopicsListAction.request());
    try {
      const { topics, pageCount } = await topicsApiClient.getTopics(params);
      const newState = (topics || []).reduce(
        (memo: TopicsState, topic) => ({
          ...memo,
          byName: {
            ...memo.byName,
            [topic.name]: {
              ...memo.byName[topic.name],
              ...topic,
              id: v4(),
            },
          },
          allNames: [...memo.allNames, topic.name],
        }),
        {
          ...getState().topics,
          allNames: [],
          totalPages: pageCount || 1,
        }
      );
      dispatch(actions.fetchTopicsListAction.success(newState));
    } catch (e) {
      dispatch(actions.fetchTopicsListAction.failure());
    }
  };

export const clearTopicsMessages =
  (clusterName: ClusterName, topicsName: TopicName[]): PromiseThunkResult =>
  async (dispatch) => {
    topicsName.forEach((topicName) => {
      dispatch(clearTopicMessages({ clusterName, topicName }));
    });
  };

export const fetchTopicDetails =
  (clusterName: ClusterName, topicName: TopicName): PromiseThunkResult =>
  async (dispatch, getState) => {
    dispatch(actions.fetchTopicDetailsAction.request());
    try {
      const topicDetails = await topicsApiClient.getTopicDetails({
        clusterName,
        topicName,
      });
      const state = getState().topics;
      const newState = {
        ...state,
        byName: {
          ...state.byName,
          [topicName]: {
            ...state.byName[topicName],
            ...topicDetails,
          },
        },
      };
      dispatch(actions.fetchTopicDetailsAction.success(newState));
    } catch (e) {
      dispatch(actions.fetchTopicDetailsAction.failure());
    }
  };

export const fetchTopicConfig =
  (clusterName: ClusterName, topicName: TopicName): PromiseThunkResult =>
  async (dispatch, getState) => {
    dispatch(actions.fetchTopicConfigAction.request());
    try {
      const config = await topicsApiClient.getTopicConfigs({
        clusterName,
        topicName,
      });

      const state = getState().topics;
      const newState = {
        ...state,
        byName: {
          ...state.byName,
          [topicName]: {
            ...state.byName[topicName],
            config: config.map((inputConfig) => ({
              ...inputConfig,
            })),
          },
        },
      };

      dispatch(actions.fetchTopicConfigAction.success(newState));
    } catch (e) {
      dispatch(actions.fetchTopicConfigAction.failure());
    }
  };

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

export const updateTopic =
  (
    clusterName: ClusterName,
    topicName: TopicName,
    form: TopicFormDataRaw
  ): PromiseThunkResult =>
  async (dispatch, getState) => {
    dispatch(actions.updateTopicAction.request());
    try {
      const topic: Topic = await topicsApiClient.updateTopic({
        clusterName,
        topicName,
        topicUpdate: formatTopicUpdate(form),
      });

      const state = getState().topics;
      const newState = {
        ...state,
        byName: {
          ...state.byName,
          [topic.name]: {
            ...state.byName[topic.name],
            ...topic,
          },
        },
      };

      dispatch(actions.updateTopicAction.success(newState));
    } catch (e) {
      dispatch(actions.updateTopicAction.failure());
    }
  };

export const deleteTopic =
  (clusterName: ClusterName, topicName: TopicName): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.deleteTopicAction.request());
    try {
      await topicsApiClient.deleteTopic({
        clusterName,
        topicName,
      });
      dispatch(actions.deleteTopicAction.success(topicName));
    } catch (e) {
      dispatch(actions.deleteTopicAction.failure());
    }
  };

export const recreateTopic =
  (clusterName: ClusterName, topicName: TopicName): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.recreateTopicAction.request());
    try {
      const topic = await topicsApiClient.recreateTopic({
        clusterName,
        topicName,
      });
      dispatch(actions.recreateTopicAction.success(topic));

      (dispatch as AppDispatch)(
        showSuccessAlert({
          id: topicName,
          message: 'Topic successfully recreated!',
        })
      );
    } catch (e) {
      dispatch(actions.recreateTopicAction.failure());
    }
  };

export const deleteTopics =
  (clusterName: ClusterName, topicsName: TopicName[]): PromiseThunkResult =>
  async (dispatch) => {
    topicsName.forEach((topicName) => {
      dispatch(deleteTopic(clusterName, topicName));
    });
  };

export const fetchTopicConsumerGroups =
  (clusterName: ClusterName, topicName: TopicName): PromiseThunkResult =>
  async (dispatch, getState) => {
    dispatch(actions.fetchTopicConsumerGroupsAction.request());
    try {
      const consumerGroups =
        await topicConsumerGroupsApiClient.getTopicConsumerGroups({
          clusterName,
          topicName,
        });
      const state = getState().topics;
      const newState = {
        ...state,
        byName: {
          ...state.byName,
          [topicName]: {
            ...state.byName[topicName],
            consumerGroups,
          },
        },
      };
      dispatch(actions.fetchTopicConsumerGroupsAction.success(newState));
    } catch (e) {
      dispatch(actions.fetchTopicConsumerGroupsAction.failure());
    }
  };

export const fetchTopicMessageSchema =
  (clusterName: ClusterName, topicName: TopicName): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.fetchTopicMessageSchemaAction.request());
    try {
      const schema = await messagesApiClient.getTopicSchema({
        clusterName,
        topicName,
      });
      dispatch(
        actions.fetchTopicMessageSchemaAction.success({ topicName, schema })
      );
    } catch (e) {
      const response = await getResponse(e);
      const alert: FailurePayload = {
        subject: ['topic', topicName].join('-'),
        title: `Topic Schema ${topicName}`,
        response,
      };
      dispatch(actions.fetchTopicMessageSchemaAction.failure({ alert }));
    }
  };

export const updateTopicPartitionsCount =
  (
    clusterName: ClusterName,
    topicName: TopicName,
    partitions: number
  ): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.updateTopicPartitionsCountAction.request());
    try {
      await topicsApiClient.increaseTopicPartitions({
        clusterName,
        topicName,
        partitionsIncrease: { totalPartitionsCount: partitions },
      });
      dispatch(actions.updateTopicPartitionsCountAction.success());
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: ['topic-partitions', topicName].join('-'),
        title: `Topic ${topicName} partitions count increase failed`,
        response,
      };
      dispatch(actions.updateTopicPartitionsCountAction.failure({ alert }));
    }
  };

export const updateTopicReplicationFactor =
  (
    clusterName: ClusterName,
    topicName: TopicName,
    replicationFactor: number
  ): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.updateTopicReplicationFactorAction.request());
    try {
      await topicsApiClient.changeReplicationFactor({
        clusterName,
        topicName,
        replicationFactorChange: { totalReplicationFactor: replicationFactor },
      });
      dispatch(actions.updateTopicReplicationFactorAction.success());
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: ['topic-replication-factor', topicName].join('-'),
        title: `Topic ${topicName} replication factor change failed`,
        response,
      };
      dispatch(actions.updateTopicReplicationFactorAction.failure({ alert }));
    }
  };
