import { BrokersApi, Configuration } from 'generated-sources';
import { PromiseThunkResult, ClusterName, BrokerId } from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import * as actions from 'redux/actions/actions';

const apiClientConf = new Configuration(BASE_PARAMS);
export const brokersApiClient = new BrokersApi(apiClientConf);

export const fetchBrokers =
  (clusterName: ClusterName): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.fetchBrokersAction.request());
    try {
      const payload = await brokersApiClient.getBrokers({ clusterName });
      dispatch(actions.fetchBrokersAction.success(payload));
    } catch (e) {
      dispatch(actions.fetchBrokersAction.failure());
    }
  };

export const fetchBrokerMetrics =
  (clusterName: ClusterName, brokerId: BrokerId): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.fetchBrokerMetricsAction.request());
    try {
      const payload = await brokersApiClient.getBrokersMetrics({
        clusterName,
        id: brokerId,
      });
      dispatch(actions.fetchBrokerMetricsAction.success(payload));
    } catch (e) {
      dispatch(actions.fetchBrokerMetricsAction.failure());
    }
  };
