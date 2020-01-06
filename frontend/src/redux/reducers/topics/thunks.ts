import { getTopics } from 'lib/api';
import { fetchTopicListAction } from './actions';
import { PromiseThunk, ClusterId } from 'types';

export const fetchTopicList = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchTopicListAction.request());

  try {
    const topics = await getTopics(clusterId);

    dispatch(fetchTopicListAction.success(topics));
  } catch (e) {
    dispatch(fetchTopicListAction.failure());
  }
}
