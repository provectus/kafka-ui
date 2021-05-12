import { ClustersApi, Configuration, Cluster } from 'generated-sources';
import { PromiseThunkResult, ClusterName } from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import * as actions from 'redux/actions/actions';

const apiClientConf = new Configuration(BASE_PARAMS);
export const clustersApiClient = new ClustersApi(apiClientConf);

export const fetchClustersList = (): PromiseThunkResult => async (dispatch) => {
  dispatch(actions.fetchClusterListAction.request());
  try {
    const clusters: Cluster[] = await clustersApiClient.getClusters();
    dispatch(actions.fetchClusterListAction.success(clusters));
  } catch (e) {
    dispatch(actions.fetchClusterListAction.failure());
  }
};

export const fetchClusterStats =
  (clusterName: ClusterName): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.fetchClusterStatsAction.request());
    try {
      const payload = await clustersApiClient.getClusterStats({ clusterName });
      dispatch(actions.fetchClusterStatsAction.success(payload));
    } catch (e) {
      dispatch(actions.fetchClusterStatsAction.failure());
    }
  };

export const fetchClusterMetrics =
  (clusterName: ClusterName): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.fetchClusterMetricsAction.request());
    try {
      const payload = await clustersApiClient.getClusterMetrics({
        clusterName,
      });
      dispatch(actions.fetchClusterMetricsAction.success(payload));
    } catch (e) {
      dispatch(actions.fetchClusterMetricsAction.failure());
    }
  };
