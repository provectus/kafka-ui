import {
  getTopics,
  getTopic,
  getBrokers,
} from 'lib/api';
import {
  fetchTopicListAction,
  fetchBrokersAction,
} from './actions';
import { Topic, TopicName, PromiseThunk } from 'types';


export const fetchTopicList = (): PromiseThunk<void> => async (dispatch, getState) => {
  dispatch(fetchTopicListAction.request());

  try {
    const topics = await getTopics();
    const detailedList = await Promise.all(topics.map((topic: TopicName): Promise<Topic> => getTopic(topic)));

    dispatch(fetchTopicListAction.success(detailedList));
  } catch (e) {
    dispatch(fetchTopicListAction.failure());
  }
}

export const fetchBrokers = (): PromiseThunk<void> => async (dispatch, getState) => {
  dispatch(fetchBrokersAction.request());
  try {
    const { brokers } = await getBrokers();
    dispatch(fetchBrokersAction.success(brokers));
  } catch (e) {
    dispatch(fetchBrokersAction.failure());
  }
}
