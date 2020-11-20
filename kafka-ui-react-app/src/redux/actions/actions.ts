import { createAsyncAction } from 'typesafe-actions';
import ActionType from 'redux/actionType';
import { TopicName, ConsumerGroupID } from 'redux/interfaces';

import {
  Cluster,
  ClusterStats,
  ClusterMetrics,
  Broker,
  BrokerMetrics,
  Topic,
  TopicDetails,
  TopicConfig,
  TopicMessage,
  ConsumerGroup,
  ConsumerGroupDetails,
} from 'generated-sources';

export const fetchClusterStatsAction = createAsyncAction(
  ActionType.GET_CLUSTER_STATS__REQUEST,
  ActionType.GET_CLUSTER_STATS__SUCCESS,
  ActionType.GET_CLUSTER_STATS__FAILURE
)<undefined, ClusterStats, undefined>();

export const fetchClusterMetricsAction = createAsyncAction(
  ActionType.GET_CLUSTER_METRICS__REQUEST,
  ActionType.GET_CLUSTER_METRICS__SUCCESS,
  ActionType.GET_CLUSTER_METRICS__FAILURE
)<undefined, ClusterMetrics, undefined>();

export const fetchBrokersAction = createAsyncAction(
  ActionType.GET_BROKERS__REQUEST,
  ActionType.GET_BROKERS__SUCCESS,
  ActionType.GET_BROKERS__FAILURE
)<undefined, Broker[], undefined>();

export const fetchBrokerMetricsAction = createAsyncAction(
  ActionType.GET_BROKER_METRICS__REQUEST,
  ActionType.GET_BROKER_METRICS__SUCCESS,
  ActionType.GET_BROKER_METRICS__FAILURE
)<undefined, BrokerMetrics, undefined>();

export const fetchClusterListAction = createAsyncAction(
  ActionType.GET_CLUSTERS__REQUEST,
  ActionType.GET_CLUSTERS__SUCCESS,
  ActionType.GET_CLUSTERS__FAILURE
)<undefined, Cluster[], undefined>();

export const fetchTopicsListAction = createAsyncAction(
  ActionType.GET_TOPICS__REQUEST,
  ActionType.GET_TOPICS__SUCCESS,
  ActionType.GET_TOPICS__FAILURE
)<undefined, Topic[], undefined>();

export const fetchTopicMessagesAction = createAsyncAction(
  ActionType.GET_TOPIC_MESSAGES__REQUEST,
  ActionType.GET_TOPIC_MESSAGES__SUCCESS,
  ActionType.GET_TOPIC_MESSAGES__FAILURE
)<undefined, TopicMessage[], undefined>();

export const fetchTopicDetailsAction = createAsyncAction(
  ActionType.GET_TOPIC_DETAILS__REQUEST,
  ActionType.GET_TOPIC_DETAILS__SUCCESS,
  ActionType.GET_TOPIC_DETAILS__FAILURE
)<undefined, { topicName: TopicName; details: TopicDetails }, undefined>();

export const fetchTopicConfigAction = createAsyncAction(
  ActionType.GET_TOPIC_CONFIG__REQUEST,
  ActionType.GET_TOPIC_CONFIG__SUCCESS,
  ActionType.GET_TOPIC_CONFIG__FAILURE
)<undefined, { topicName: TopicName; config: TopicConfig[] }, undefined>();

export const createTopicAction = createAsyncAction(
  ActionType.POST_TOPIC__REQUEST,
  ActionType.POST_TOPIC__SUCCESS,
  ActionType.POST_TOPIC__FAILURE
)<undefined, Topic, undefined>();

export const updateTopicAction = createAsyncAction(
  ActionType.PATCH_TOPIC__REQUEST,
  ActionType.PATCH_TOPIC__SUCCESS,
  ActionType.PATCH_TOPIC__FAILURE
)<undefined, Topic, undefined>();

export const fetchConsumerGroupsAction = createAsyncAction(
  ActionType.GET_CONSUMER_GROUPS__REQUEST,
  ActionType.GET_CONSUMER_GROUPS__SUCCESS,
  ActionType.GET_CONSUMER_GROUPS__FAILURE
)<undefined, ConsumerGroup[], undefined>();

export const fetchConsumerGroupDetailsAction = createAsyncAction(
  ActionType.GET_CONSUMER_GROUP_DETAILS__REQUEST,
  ActionType.GET_CONSUMER_GROUP_DETAILS__SUCCESS,
  ActionType.GET_CONSUMER_GROUP_DETAILS__FAILURE
)<
  undefined,
  { consumerGroupID: ConsumerGroupID; details: ConsumerGroupDetails },
  undefined
>();
