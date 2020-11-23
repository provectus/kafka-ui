import { createSelector } from 'reselect';
import { RootState, FetchStatus, Cluster } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { ServerStatus } from 'generated-sources';

const clustersState = ({ clusters }: RootState): Cluster[] => clusters;

const getClusterListFetchingStatus = createFetchingSelector('GET_CLUSTERS');

export const getIsClusterListFetched = createSelector(
  getClusterListFetchingStatus,
  (status) => status === FetchStatus.fetched
);

export const getClusterList = createSelector(
  clustersState,
  (clusters) => clusters
);

export const getOnlineClusters = createSelector(getClusterList, (clusters) =>
  clusters.filter(({ status }) => status === ServerStatus.Online)
);

export const getOfflineClusters = createSelector(getClusterList, (clusters) =>
  clusters.filter(({ status }) => status === ServerStatus.Offline)
);
