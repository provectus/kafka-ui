import { createAction, createAsyncAction } from 'typesafe-actions';
import {
  ConsumerGroupID,
  FailurePayload,
  TopicName,
  TopicsState,
  ConnectorName,
  ConnectorConfig,
} from 'redux/interfaces';
import {
  Cluster,
  ClusterStats,
  ClusterMetrics,
  Broker,
  BrokerMetrics,
  TopicMessage,
  ConsumerGroup,
  ConsumerGroupDetails,
  SchemaSubject,
  CompatibilityLevelCompatibilityEnum,
  TopicColumnsToSort,
  Connector,
  FullConnectorInfo,
  Connect,
  Task,
  TopicMessageSchema,
} from 'generated-sources';

export const fetchClusterStatsAction = createAsyncAction(
  'GET_CLUSTER_STATUS__REQUEST',
  'GET_CLUSTER_STATUS__SUCCESS',
  'GET_CLUSTER_STATUS__FAILURE'
)<undefined, ClusterStats, undefined>();

export const fetchClusterMetricsAction = createAsyncAction(
  'GET_CLUSTER_METRICS__REQUEST',
  'GET_CLUSTER_METRICS__SUCCESS',
  'GET_CLUSTER_METRICS__FAILURE'
)<undefined, ClusterMetrics, undefined>();

export const fetchBrokersAction = createAsyncAction(
  'GET_BROKERS__REQUEST',
  'GET_BROKERS__SUCCESS',
  'GET_BROKERS__FAILURE'
)<undefined, Broker[], undefined>();

export const fetchBrokerMetricsAction = createAsyncAction(
  'GET_BROKER_METRICS__REQUEST',
  'GET_BROKER_METRICS__SUCCESS',
  'GET_BROKER_METRICS__FAILURE'
)<undefined, BrokerMetrics, undefined>();

export const fetchClusterListAction = createAsyncAction(
  'GET_CLUSTERS__REQUEST',
  'GET_CLUSTERS__SUCCESS',
  'GET_CLUSTERS__FAILURE'
)<undefined, Cluster[], undefined>();

export const fetchTopicsListAction = createAsyncAction(
  'GET_TOPICS__REQUEST',
  'GET_TOPICS__SUCCESS',
  'GET_TOPICS__FAILURE'
)<undefined, TopicsState, undefined>();

export const fetchTopicMessagesAction = createAsyncAction(
  'GET_TOPIC_MESSAGES__REQUEST',
  'GET_TOPIC_MESSAGES__SUCCESS',
  'GET_TOPIC_MESSAGES__FAILURE'
)<undefined, TopicMessage[], undefined>();

export const clearMessagesTopicAction = createAsyncAction(
  'CLEAR_TOPIC_MESSAGES__REQUEST',
  'CLEAR_TOPIC_MESSAGES__SUCCESS',
  'CLEAR_TOPIC_MESSAGES__FAILURE'
)<undefined, TopicName, { alert?: FailurePayload }>();

export const fetchTopicDetailsAction = createAsyncAction(
  'GET_TOPIC_DETAILS__REQUEST',
  'GET_TOPIC_DETAILS__SUCCESS',
  'GET_TOPIC_DETAILS__FAILURE'
)<undefined, TopicsState, undefined>();

export const fetchTopicConfigAction = createAsyncAction(
  'GET_TOPIC_CONFIG__REQUEST',
  'GET_TOPIC_CONFIG__SUCCESS',
  'GET_TOPIC_CONFIG__FAILURE'
)<undefined, TopicsState, undefined>();

export const createTopicAction = createAsyncAction(
  'POST_TOPIC__REQUEST',
  'POST_TOPIC__SUCCESS',
  'POST_TOPIC__FAILURE'
)<undefined, TopicsState, { alert?: FailurePayload }>();

export const updateTopicAction = createAsyncAction(
  'PATCH_TOPIC__REQUEST',
  'PATCH_TOPIC__SUCCESS',
  'PATCH_TOPIC__FAILURE'
)<undefined, TopicsState, undefined>();

export const deleteTopicAction = createAsyncAction(
  'DELETE_TOPIC__REQUEST',
  'DELETE_TOPIC__SUCCESS',
  'DELETE_TOPIC__FAILURE'
)<undefined, TopicName, undefined>();

export const fetchConsumerGroupsAction = createAsyncAction(
  'GET_CONSUMER_GROUPS__REQUEST',
  'GET_CONSUMER_GROUPS__SUCCESS',
  'GET_CONSUMER_GROUPS__FAILURE'
)<undefined, ConsumerGroup[], undefined>();

export const fetchConsumerGroupDetailsAction = createAsyncAction(
  'GET_CONSUMER_GROUP_DETAILS__REQUEST',
  'GET_CONSUMER_GROUP_DETAILS__SUCCESS',
  'GET_CONSUMER_GROUP_DETAILS__FAILURE'
)<
  undefined,
  { consumerGroupID: ConsumerGroupID; details: ConsumerGroupDetails },
  undefined
>();

export const deleteConsumerGroupAction = createAsyncAction(
  'DELETE_CONSUMER_GROUP__REQUEST',
  'DELETE_CONSUMER_GROUP__SUCCESS',
  'DELETE_CONSUMER_GROUP__FAILURE'
)<undefined, ConsumerGroupID, { alert?: FailurePayload }>();

export const fetchSchemasByClusterNameAction = createAsyncAction(
  'GET_CLUSTER_SCHEMAS__REQUEST',
  'GET_CLUSTER_SCHEMAS__SUCCESS',
  'GET_CLUSTER_SCHEMAS__FAILURE'
)<undefined, SchemaSubject[], undefined>();

export const fetchGlobalSchemaCompatibilityLevelAction = createAsyncAction(
  'GET_GLOBAL_SCHEMA_COMPATIBILITY__REQUEST',
  'GET_GLOBAL_SCHEMA_COMPATIBILITY__SUCCESS',
  'GET_GLOBAL_SCHEMA_COMPATIBILITY__FAILURE'
)<undefined, CompatibilityLevelCompatibilityEnum, undefined>();

export const updateGlobalSchemaCompatibilityLevelAction = createAsyncAction(
  'PUT_GLOBAL_SCHEMA_COMPATIBILITY__REQUEST',
  'PUT_GLOBAL_SCHEMA_COMPATIBILITY__SUCCESS',
  'PUT_GLOBAL_SCHEMA_COMPATIBILITY__FAILURE'
)<undefined, CompatibilityLevelCompatibilityEnum, undefined>();

export const fetchSchemaVersionsAction = createAsyncAction(
  'GET_SCHEMA_VERSIONS__REQUEST',
  'GET_SCHEMA_VERSIONS__SUCCESS',
  'GET_SCHEMA_VERSIONS__FAILURE'
)<undefined, SchemaSubject[], undefined>();

export const createSchemaAction = createAsyncAction(
  'POST_SCHEMA__REQUEST',
  'POST_SCHEMA__SUCCESS',
  'POST_SCHEMA__FAILURE'
)<undefined, SchemaSubject, { alert?: FailurePayload }>();

export const updateSchemaAction = createAsyncAction(
  'PATCH_SCHEMA__REQUEST',
  'PATCH_SCHEMA__SUCCESS',
  'PATCH_SCHEMA__FAILURE'
)<undefined, SchemaSubject, { alert?: FailurePayload }>();

export const deleteSchemaAction = createAsyncAction(
  'DELETE_SCHEMA__REQUEST',
  'DELETE_SCHEMA__SUCCESS',
  'DELETE_SCHEMA__FAILURE'
)<undefined, string, { alert?: FailurePayload }>();

export const dismissAlert = createAction('DISMISS_ALERT')<string>();

export const fetchConnectsAction = createAsyncAction(
  'GET_CONNECTS__REQUEST',
  'GET_CONNECTS__SUCCESS',
  'GET_CONNECTS__FAILURE'
)<undefined, { connects: Connect[] }, { alert?: FailurePayload }>();

export const fetchConnectorsAction = createAsyncAction(
  'GET_CONNECTORS__REQUEST',
  'GET_CONNECTORS__SUCCESS',
  'GET_CONNECTORS__FAILURE'
)<undefined, { connectors: FullConnectorInfo[] }, { alert?: FailurePayload }>();

export const fetchConnectorAction = createAsyncAction(
  'GET_CONNECTOR__REQUEST',
  'GET_CONNECTOR__SUCCESS',
  'GET_CONNECTOR__FAILURE'
)<undefined, { connector: Connector }, { alert?: FailurePayload }>();

export const createConnectorAction = createAsyncAction(
  'POST_CONNECTOR__REQUEST',
  'POST_CONNECTOR__SUCCESS',
  'POST_CONNECTOR__FAILURE'
)<undefined, { connector: Connector }, { alert?: FailurePayload }>();

export const deleteConnectorAction = createAsyncAction(
  'DELETE_CONNECTOR__REQUEST',
  'DELETE_CONNECTOR__SUCCESS',
  'DELETE_CONNECTOR__FAILURE'
)<undefined, { connectorName: ConnectorName }, { alert?: FailurePayload }>();

export const restartConnectorAction = createAsyncAction(
  'RESTART_CONNECTOR__REQUEST',
  'RESTART_CONNECTOR__SUCCESS',
  'RESTART_CONNECTOR__FAILURE'
)<undefined, undefined, { alert?: FailurePayload }>();

export const pauseConnectorAction = createAsyncAction(
  'PAUSE_CONNECTOR__REQUEST',
  'PAUSE_CONNECTOR__SUCCESS',
  'PAUSE_CONNECTOR__FAILURE'
)<undefined, { connectorName: ConnectorName }, { alert?: FailurePayload }>();

export const resumeConnectorAction = createAsyncAction(
  'RESUME_CONNECTOR__REQUEST',
  'RESUME_CONNECTOR__SUCCESS',
  'RESUME_CONNECTOR__FAILURE'
)<undefined, { connectorName: ConnectorName }, { alert?: FailurePayload }>();

export const fetchConnectorTasksAction = createAsyncAction(
  'GET_CONNECTOR_TASKS__REQUEST',
  'GET_CONNECTOR_TASKS__SUCCESS',
  'GET_CONNECTOR_TASKS__FAILURE'
)<undefined, { tasks: Task[] }, { alert?: FailurePayload }>();

export const restartConnectorTaskAction = createAsyncAction(
  'RESTART_CONNECTOR_TASK__REQUEST',
  'RESTART_CONNECTOR_TASK__SUCCESS',
  'RESTART_CONNECTOR_TASK__FAILURE'
)<undefined, undefined, { alert?: FailurePayload }>();

export const fetchConnectorConfigAction = createAsyncAction(
  'GET_CONNECTOR_CONFIG__REQUEST',
  'GET_CONNECTOR_CONFIG__SUCCESS',
  'GET_CONNECTOR_CONFIG__FAILURE'
)<undefined, { config: ConnectorConfig }, { alert?: FailurePayload }>();

export const updateConnectorConfigAction = createAsyncAction(
  'PATCH_CONNECTOR_CONFIG__REQUEST',
  'PATCH_CONNECTOR_CONFIG__SUCCESS',
  'PATCH_CONNECTOR_CONFIG__FAILURE'
)<undefined, { connector: Connector }, { alert?: FailurePayload }>();

export const setTopicsSearchAction =
  createAction('SET_TOPICS_SEARCH')<string>();

export const setTopicsOrderByAction = createAction(
  'SET_TOPICS_ORDER_BY'
)<TopicColumnsToSort>();

export const fetchTopicConsumerGroupsAction = createAsyncAction(
  'GET_TOPIC_CONSUMER_GROUPS__REQUEST',
  'GET_TOPIC_CONSUMER_GROUPS__SUCCESS',
  'GET_TOPIC_CONSUMER_GROUPS__FAILURE'
)<undefined, TopicsState, undefined>();

export const fetchTopicMessageSchemaAction = createAsyncAction(
  'GET_TOPIC_SCHEMA__REQUEST',
  'GET_TOPIC_SCHEMA__SUCCESS',
  'GET_TOPIC_SCHEMA__FAILURE'
)<
  undefined,
  { topicName: string; schema: TopicMessageSchema },
  { alert?: FailurePayload }
>();

export const sendTopicMessageAction = createAsyncAction(
  'SEND_TOPIC_MESSAGE__REQUEST',
  'SEND_TOPIC_MESSAGE__SUCCESS',
  'SEND_TOPIC_MESSAGE__FAILURE'
)<undefined, undefined, { alert?: FailurePayload }>();

export const updateTopicPartitionsCountAction = createAsyncAction(
  'UPDATE_PARTITIONS__REQUEST',
  'UPDATE_PARTITIONS__SUCCESS',
  'UPDATE_PARTITIONS__FAILURE'
)<undefined, undefined, { alert?: FailurePayload }>();

export const updateTopicReplicationFactorAction = createAsyncAction(
  'UPDATE_REPLICATION_FACTOR__REQUEST',
  'UPDATE_REPLICATION_FACTOR__SUCCESS',
  'UPDATE_REPLICATION_FACTOR__FAILURE'
)<undefined, undefined, { alert?: FailurePayload }>();
