import { createAction, createAsyncAction } from 'typesafe-actions';
import {
  ConsumerGroupID,
  FailurePayload,
  TopicName,
  TopicsState,
  ConnectState,
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

export const fetchSchemasByClusterNameAction = createAsyncAction(
  'GET_CLUSTER_SCHEMAS__REQUEST',
  'GET_CLUSTER_SCHEMAS__SUCCESS',
  'GET_CLUSTER_SCHEMAS__FAILURE'
)<undefined, SchemaSubject[], undefined>();

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

export const updateSchemaCompatibilityLevelAction = createAsyncAction(
  'PATCH_SCHEMA_COMPATIBILITY__REQUEST',
  'PATCH_SCHEMA_COMPATIBILITY__SUCCESS',
  'PATCH_SCHEMA_COMPATIBILITY__FAILURE'
)<undefined, undefined, { alert?: FailurePayload }>();

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
)<undefined, ConnectState, { alert?: FailurePayload }>();

export const fetchConnectorsAction = createAsyncAction(
  'GET_CONNECTORS__REQUEST',
  'GET_CONNECTORS__SUCCESS',
  'GET_CONNECTORS__FAILURE'
)<undefined, ConnectState, { alert?: FailurePayload }>();

export const fetchConnectorAction = createAsyncAction(
  'GET_CONNECTOR__REQUEST',
  'GET_CONNECTOR__SUCCESS',
  'GET_CONNECTOR__FAILURE'
)<undefined, ConnectState, { alert?: FailurePayload }>();

export const deleteConnectorAction = createAsyncAction(
  'DELETE_CONNECTOR__REQUEST',
  'DELETE_CONNECTOR__SUCCESS',
  'DELETE_CONNECTOR__FAILURE'
)<undefined, ConnectState, { alert?: FailurePayload }>();
