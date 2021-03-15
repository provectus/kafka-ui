import {
  ClustersApi,
  BrokersApi,
  TopicsApi,
  ConsumerGroupsApi,
  SchemasApi,
  MessagesApi,
  Configuration,
  Cluster,
  Topic,
  TopicFormData,
  TopicConfig,
  NewSchemaSubject,
  SchemaSubject,
} from 'generated-sources';
import {
  ConsumerGroupID,
  PromiseThunkResult,
  ClusterName,
  BrokerId,
  TopicName,
  TopicMessageQueryParams,
  TopicFormFormattedParams,
  TopicFormDataRaw,
  SchemaName,
} from 'redux/interfaces';

import { BASE_PARAMS } from 'lib/constants';
import * as actions from './actions';

const apiClientConf = new Configuration(BASE_PARAMS);
export const clustersApiClient = new ClustersApi(apiClientConf);
export const brokersApiClient = new BrokersApi(apiClientConf);
export const topicsApiClient = new TopicsApi(apiClientConf);
export const consumerGroupsApiClient = new ConsumerGroupsApi(apiClientConf);
export const schemasApiClient = new SchemasApi(apiClientConf);
export const messagesApiClient = new MessagesApi(apiClientConf);

export const fetchClustersList = (): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchClusterListAction.request());
  try {
    const clusters: Cluster[] = await clustersApiClient.getClusters();
    dispatch(actions.fetchClusterListAction.success(clusters));
  } catch (e) {
    dispatch(actions.fetchClusterListAction.failure());
  }
};

export const fetchClusterStats = (
  clusterName: ClusterName
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchClusterStatsAction.request());
  try {
    const payload = await clustersApiClient.getClusterStats({ clusterName });
    dispatch(actions.fetchClusterStatsAction.success(payload));
  } catch (e) {
    dispatch(actions.fetchClusterStatsAction.failure());
  }
};

export const fetchClusterMetrics = (
  clusterName: ClusterName
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchClusterMetricsAction.request());
  try {
    const payload = await clustersApiClient.getClusterMetrics({ clusterName });
    dispatch(actions.fetchClusterMetricsAction.success(payload));
  } catch (e) {
    dispatch(actions.fetchClusterMetricsAction.failure());
  }
};

export const fetchBrokers = (
  clusterName: ClusterName
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchBrokersAction.request());
  try {
    const payload = await brokersApiClient.getBrokers({ clusterName });
    dispatch(actions.fetchBrokersAction.success(payload));
  } catch (e) {
    dispatch(actions.fetchBrokersAction.failure());
  }
};

export const fetchBrokerMetrics = (
  clusterName: ClusterName,
  brokerId: BrokerId
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchBrokerMetricsAction.request());
  try {
    const payload = await brokersApiClient.getBrokersMetrics({
      clusterName,
      id: brokerId,
    });
    dispatch(actions.fetchBrokerMetricsAction.success(payload));
  } catch (e) {
    dispatch(actions.fetchBrokerMetricsAction.failure());
  }
};

export const fetchTopicsList = (
  clusterName: ClusterName
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchTopicsListAction.request());
  try {
    const topics = await topicsApiClient.getTopics({ clusterName });
    dispatch(actions.fetchTopicsListAction.success(topics.topics || []));
  } catch (e) {
    dispatch(actions.fetchTopicsListAction.failure());
  }
};

export const fetchTopicMessages = (
  clusterName: ClusterName,
  topicName: TopicName,
  queryParams: Partial<TopicMessageQueryParams>
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchTopicMessagesAction.request());
  try {
    const messages = await messagesApiClient.getTopicMessages({
      clusterName,
      topicName,
      ...queryParams,
    });
    dispatch(actions.fetchTopicMessagesAction.success(messages));
  } catch (e) {
    dispatch(actions.fetchTopicMessagesAction.failure());
  }
};

export const fetchTopicDetails = (
  clusterName: ClusterName,
  topicName: TopicName
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchTopicDetailsAction.request());
  try {
    const topicDetails = await topicsApiClient.getTopicDetails({
      clusterName,
      topicName,
    });
    dispatch(
      actions.fetchTopicDetailsAction.success({
        topicName,
        details: topicDetails,
      })
    );
  } catch (e) {
    dispatch(actions.fetchTopicDetailsAction.failure());
  }
};

export const fetchTopicConfig = (
  clusterName: ClusterName,
  topicName: TopicName
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchTopicConfigAction.request());
  try {
    const config = await topicsApiClient.getTopicConfigs({
      clusterName,
      topicName,
    });
    dispatch(actions.fetchTopicConfigAction.success({ topicName, config }));
  } catch (e) {
    dispatch(actions.fetchTopicConfigAction.failure());
  }
};

const formatTopicFormData = (form: TopicFormDataRaw): TopicFormData => {
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
      'retention.ms': retentionMs,
      'retention.bytes': retentionBytes,
      'max.message.bytes': maxMessageBytes,
      'min.insync.replicas': minInSyncReplicas,
      ...Object.values(customParams || {}).reduce(
        (result: TopicFormFormattedParams, customParam: TopicConfig) => {
          return {
            ...result,
            [customParam.name]: customParam.value,
          };
        },
        {}
      ),
    },
  };
};

export const createTopic = (
  clusterName: ClusterName,
  form: TopicFormDataRaw
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.createTopicAction.request());
  try {
    const topic: Topic = await topicsApiClient.createTopic({
      clusterName,
      topicFormData: formatTopicFormData(form),
    });
    dispatch(actions.createTopicAction.success(topic));
  } catch (e) {
    dispatch(actions.createTopicAction.failure());
  }
};

export const updateTopic = (
  clusterName: ClusterName,
  form: TopicFormDataRaw
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.updateTopicAction.request());
  try {
    const topic: Topic = await topicsApiClient.updateTopic({
      clusterName,
      topicName: form.name,
      topicFormData: formatTopicFormData(form),
    });
    dispatch(actions.updateTopicAction.success(topic));
  } catch (e) {
    dispatch(actions.updateTopicAction.failure());
  }
};

export const fetchConsumerGroupsList = (
  clusterName: ClusterName
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchConsumerGroupsAction.request());
  try {
    const consumerGroups = await consumerGroupsApiClient.getConsumerGroups({
      clusterName,
    });
    dispatch(actions.fetchConsumerGroupsAction.success(consumerGroups));
  } catch (e) {
    dispatch(actions.fetchConsumerGroupsAction.failure());
  }
};

export const fetchConsumerGroupDetails = (
  clusterName: ClusterName,
  consumerGroupID: ConsumerGroupID
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchConsumerGroupDetailsAction.request());
  try {
    const consumerGroupDetails = await consumerGroupsApiClient.getConsumerGroup(
      {
        clusterName,
        id: consumerGroupID,
      }
    );
    dispatch(
      actions.fetchConsumerGroupDetailsAction.success({
        consumerGroupID,
        details: consumerGroupDetails,
      })
    );
  } catch (e) {
    dispatch(actions.fetchConsumerGroupDetailsAction.failure());
  }
};

export const fetchSchemasByClusterName = (
  clusterName: ClusterName
): PromiseThunkResult<void> => async (dispatch) => {
  dispatch(actions.fetchSchemasByClusterNameAction.request());
  try {
    const schemas = await schemasApiClient.getSchemas({ clusterName });
    dispatch(actions.fetchSchemasByClusterNameAction.success(schemas));
  } catch (e) {
    dispatch(actions.fetchSchemasByClusterNameAction.failure());
  }
};

export const fetchSchemaVersions = (
  clusterName: ClusterName,
  subject: SchemaName
): PromiseThunkResult<void> => async (dispatch) => {
  if (!subject) return;
  dispatch(actions.fetchSchemaVersionsAction.request());
  try {
    const versions = await schemasApiClient.getAllVersionsBySubject({
      clusterName,
      subject,
    });
    dispatch(actions.fetchSchemaVersionsAction.success(versions));
  } catch (e) {
    dispatch(actions.fetchSchemaVersionsAction.failure());
  }
};

export const createSchema = (
  clusterName: ClusterName,
  newSchemaSubject: NewSchemaSubject
): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.createSchemaAction.request());
  try {
    const schema: SchemaSubject = await schemasApiClient.createNewSchema({
      clusterName,
      newSchemaSubject,
    });
    dispatch(actions.createSchemaAction.success(schema));
  } catch (e) {
    dispatch(actions.createSchemaAction.failure());
    throw e;
  }
};
