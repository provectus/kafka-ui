import * as api from 'redux/api';
import * as actions from './actions';
import {
  PromiseThunk,
  Cluster,
  ClusterName,
  TopicFormData,
  TopicName, Topic,
} from 'redux/interfaces';

export const fetchBrokers = (clusterName: ClusterName): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchBrokersAction.request());
  try {
    const payload = await api.getBrokers(clusterName);
    dispatch(actions.fetchBrokersAction.success(payload));
  } catch (e) {
    dispatch(actions.fetchBrokersAction.failure());
  }
};

export const fetchBrokerMetrics = (clusterName: ClusterName): PromiseThunk<void> => async (dispatch) => {
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

export const fetchTopicList = (clusterName: ClusterName): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicListAction.request());
  try {
    const topics = await api.getTopics(clusterName);
    dispatch(actions.fetchTopicListAction.success(topics));
  } catch (e) {
    dispatch(actions.fetchTopicListAction.failure());
  }
};

export const fetchTopicDetails = (clusterName: ClusterName, topicName: TopicName): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicDetailsAction.request());
  try {
    const topicDetails = await api.getTopicDetails(clusterName, topicName);
    dispatch(actions.fetchTopicDetailsAction.success({ topicName, details: topicDetails }));
  } catch (e) {
    dispatch(actions.fetchTopicDetailsAction.failure());
  }
};

export const fetchTopicConfig = (clusterName: ClusterName, topicName: TopicName): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicConfigAction.request());
  try {
    const config = await api.getTopicConfig(clusterName, topicName);
    dispatch(actions.fetchTopicConfigAction.success({ topicName, config }));
  } catch (e) {
    dispatch(actions.fetchTopicConfigAction.failure());
  }
};

export const createTopic = (clusterName: ClusterName, form: TopicFormData): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.createTopicAction.request());
  try {
    const topic: Topic = await api.postTopic(clusterName, form);
    dispatch(actions.createTopicAction.success(topic));
  } catch (e) {
    dispatch(actions.createTopicAction.failure());
  }
};

export const fetchConsumerGroupsList = (clusterName: ClusterName): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchConsumerGroupsAction.request());
  try {
    const consumerGroups = await api.getConsumerGroups(clusterName);
    dispatch(actions.fetchConsumerGroupsAction.success(consumerGroups));
  } catch (e) {
    dispatch(actions.fetchConsumerGroupsAction.failure());
  }
};
