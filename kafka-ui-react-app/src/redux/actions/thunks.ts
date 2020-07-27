import * as api from 'redux/api';
import {
  ConsumerGroupID,
  PromiseThunk,
  Cluster,
  ClusterName,
  TopicFormData,
  TopicName,
  Topic,
  TopicMessageQueryParams,
} from 'redux/interfaces';

import * as actions from './actions';

export const fetchBrokers = (
  clusterName: ClusterName
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchBrokersAction.request());
  try {
    const payload = await api.getBrokers(clusterName);
    dispatch(actions.fetchBrokersAction.success(payload));
  } catch (e) {
    dispatch(actions.fetchBrokersAction.failure());
  }
};

export const fetchBrokerMetrics = (
  clusterName: ClusterName
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchBrokerMetricsAction.request());
  try {
    const payload = await api.getBrokerMetrics(clusterName);
    dispatch(actions.fetchBrokerMetricsAction.success(payload));
  } catch (e) {
    dispatch(actions.fetchBrokerMetricsAction.failure());
  }
};

export const fetchClustersList = (): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchClusterListAction.request());
  try {
    const clusters: Cluster[] = await api.getClusters();
    dispatch(actions.fetchClusterListAction.success(clusters));
  } catch (e) {
    dispatch(actions.fetchClusterListAction.failure());
  }
};

export const fetchTopicList = (
  clusterName: ClusterName
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicListAction.request());
  try {
    const topics = await api.getTopics(clusterName);
    dispatch(actions.fetchTopicListAction.success(topics));
  } catch (e) {
    dispatch(actions.fetchTopicListAction.failure());
  }
};

export const fetchTopicMessages = (
  clusterName: ClusterName,
  topicName: TopicName,
  queryParams: Partial<TopicMessageQueryParams>
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicMessagesAction.request());
  try {
    const messages = await api.getTopicMessages(
      clusterName,
      topicName,
      queryParams
    );
    dispatch(actions.fetchTopicMessagesAction.success(messages));
  } catch (e) {
    dispatch(actions.fetchTopicMessagesAction.failure());
  }
};

export const fetchTopicDetails = (
  clusterName: ClusterName,
  topicName: TopicName
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicDetailsAction.request());
  try {
    const topicDetails = await api.getTopicDetails(clusterName, topicName);
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
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicConfigAction.request());
  try {
    const config = await api.getTopicConfig(clusterName, topicName);
    dispatch(actions.fetchTopicConfigAction.success({ topicName, config }));
  } catch (e) {
    dispatch(actions.fetchTopicConfigAction.failure());
  }
};

export const createTopic = (
  clusterName: ClusterName,
  form: TopicFormData
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.createTopicAction.request());
  try {
    const topic: Topic = await api.postTopic(clusterName, form);
    dispatch(actions.createTopicAction.success(topic));
  } catch (e) {
    dispatch(actions.createTopicAction.failure());
  }
};

export const updateTopic = (
  clusterName: ClusterName,
  form: TopicFormData
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.updateTopicAction.request());
  try {
    const topic: Topic = await api.patchTopic(clusterName, form);
    dispatch(actions.updateTopicAction.success(topic));
  } catch (e) {
    dispatch(actions.updateTopicAction.failure());
  }
};

export const fetchConsumerGroupsList = (
  clusterName: ClusterName
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchConsumerGroupsAction.request());
  try {
    const consumerGroups = await api.getConsumerGroups(clusterName);
    dispatch(actions.fetchConsumerGroupsAction.success(consumerGroups));
  } catch (e) {
    dispatch(actions.fetchConsumerGroupsAction.failure());
  }
};

export const fetchConsumerGroupDetails = (
  clusterName: ClusterName,
  consumerGroupID: ConsumerGroupID
): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchConsumerGroupDetailsAction.request());
  try {
    const consumerGroupDetails = await api.getConsumerGroupDetails(
      clusterName,
      consumerGroupID
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
