import {
  getTopics,
  getTopicDetails,
  getTopicConfig,
  postTopic,
} from 'lib/api';
import {
  fetchTopicListAction,
  fetchTopicDetailsAction,
  fetchTopicConfigAction,
  createTopicAction,
} from './actions';
import { PromiseThunk, ClusterId, TopicName, TopicFormData } from 'lib/interfaces';

export const fetchTopicList = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchTopicListAction.request());
  try {
    const topics = await getTopics(clusterId);
    dispatch(fetchTopicListAction.success(topics));
  } catch (e) {
    dispatch(fetchTopicListAction.failure());
  }
}

export const fetchTopicDetails = (clusterId: ClusterId, topicName: TopicName): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchTopicDetailsAction.request());
  try {
    const topicDetails = await getTopicDetails(clusterId, topicName);
    dispatch(fetchTopicDetailsAction.success({ topicName, details: topicDetails }));
  } catch (e) {
    dispatch(fetchTopicDetailsAction.failure());
  }
}

export const fetchTopicConfig = (clusterId: ClusterId, topicName: TopicName): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchTopicConfigAction.request());
  try {
    const config = await getTopicConfig(clusterId, topicName);
    dispatch(fetchTopicConfigAction.success({ topicName, config }));
  } catch (e) {
    dispatch(fetchTopicConfigAction.failure());
  }
}

export const createTopic = (clusterId: ClusterId, form: TopicFormData): PromiseThunk<void> => async (dispatch) => {
  dispatch(createTopicAction.request());

  try {
    await postTopic(clusterId, form);
    dispatch(createTopicAction.success());
  } catch (e) {
    dispatch(createTopicAction.failure());
  }
}
