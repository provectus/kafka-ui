import { createSelector } from 'reselect';
import { Cluster, RootState, FetchStatus } from 'types';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const clustersState = ({ clusters }: RootState): Cluster[] => clusters;

const getClusterListFetchingStatus = createFetchingSelector('GET_CLUSTERS');

export const getIsClusterListFetched = createSelector(
  getClusterListFetchingStatus,
  (status) => status === FetchStatus.fetched,
);

export const getClusterList = createSelector(clustersState, (clusters) => clusters);
