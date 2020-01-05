import {
  getTopics,
  getTopic,
  getBrokers,
} from 'lib/api';
import {
  fetchTopicListAction,
  fetchBrokersAction,
} from './actions';
import { Topic, TopicName, PromiseThunk, ClusterId } from 'types';


export const fetchTopicList = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchTopicListAction.request());

  try {
    const topics = await getTopics(clusterId);

    dispatch(fetchTopicListAction.success(topics));
  } catch (e) {
    dispatch(fetchTopicListAction.failure());
  }
}

export const fetchBrokers = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchBrokersAction.request());
  try {
    const { brokers } = await getBrokers(clusterId);
    dispatch(fetchBrokersAction.success(brokers));
  } catch (e) {
    dispatch(fetchBrokersAction.failure());
  }
}
