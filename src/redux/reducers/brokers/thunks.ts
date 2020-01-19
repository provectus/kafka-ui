import { getBrokers, getBrokerMetrics } from 'lib/api';
import {
  fetchBrokersAction,
  fetchBrokerMetricsAction,
} from './actions';
import { PromiseThunk, ClusterId } from 'lib/interfaces';


export const fetchBrokers = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchBrokersAction.request());
  try {
    const payload = await getBrokers(clusterId);
    dispatch(fetchBrokersAction.success(payload));
  } catch (e) {
    dispatch(fetchBrokersAction.failure());
  }
}

export const fetchBrokerMetrics = (clusterId: ClusterId): PromiseThunk<void> => async (dispatch) => {
  dispatch(fetchBrokerMetricsAction.request());
  try {
    const payload = await getBrokerMetrics(clusterId);
    dispatch(fetchBrokerMetricsAction.success(payload));
  } catch (e) {
    dispatch(fetchBrokerMetricsAction.failure());
  }
}
