import * as api from 'redux/api';
import * as actions from './actions';
import {
  PromiseThunk,
  Cluster,
  ClusterId,
  TopicFormData,
  TopicName,
} from 'redux/interfaces';

export const fetchBrokers = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchBrokersAction.request());
  try {
    const payload = await api.getBrokers(clusterId);
    dispatch(actions.fetchBrokersAction.success(payload));
  } catch (e) {
    dispatch(actions.fetchBrokersAction.failure());
  }
}

export const fetchBrokerMetrics = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchBrokerMetricsAction.request());
  try {
    const payload = await api.getBrokerMetrics(clusterId);
    dispatch(actions.fetchBrokerMetricsAction.success(payload));
  } catch (e) {
    dispatch(actions.fetchBrokerMetricsAction.failure());
  }
}

export const fetchClustersList = (): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchClusterListAction.request());
  try {
    const clusters: Cluster[] = await api.getClusters();
    dispatch(actions.fetchClusterListAction.success(clusters));
  } catch (e) {
    dispatch(actions.fetchClusterListAction.failure());
  }
}

export const fetchTopicList = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicListAction.request());
  try {
    const topics = await api.getTopics(clusterId);
    dispatch(actions.fetchTopicListAction.success(topics));
  } catch (e) {
    dispatch(actions.fetchTopicListAction.failure());
  }
}

export const fetchTopicDetails = (clusterId: ClusterId, topicName: TopicName): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicDetailsAction.request());
  try {
    const topicDetails = await api.getTopicDetails(clusterId, topicName);
    dispatch(actions.fetchTopicDetailsAction.success({ topicName, details: topicDetails }));
  } catch (e) {
    dispatch(actions.fetchTopicDetailsAction.failure());
  }
}

export const fetchTopicConfig = (clusterId: ClusterId, topicName: TopicName): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.fetchTopicConfigAction.request());
  try {
    const config = await api.getTopicConfig(clusterId, topicName);
    dispatch(actions.fetchTopicConfigAction.success({ topicName, config }));
  } catch (e) {
    dispatch(actions.fetchTopicConfigAction.failure());
  }
}

export const createTopic = (clusterId: ClusterId, form: TopicFormData): PromiseThunk<void> => async (dispatch) => {
  dispatch(actions.createTopicAction.request());
  try {
    await api.postTopic(clusterId, form);
    dispatch(actions.createTopicAction.success());
  } catch (e) {
    dispatch(actions.createTopicAction.failure());
  }
}
