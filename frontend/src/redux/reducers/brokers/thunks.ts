import { getBrokers } from 'lib/api';
import { fetchBrokersAction } from './actions';
import { PromiseThunk, ClusterId } from 'types';


export const fetchBrokers = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchBrokersAction.request());
  try {
    const { brokers } = await getBrokers(clusterId);
    dispatch(fetchBrokersAction.success(brokers));
  } catch (e) {
    dispatch(fetchBrokersAction.failure());
  }
}
