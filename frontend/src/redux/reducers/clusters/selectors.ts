import { createSelector } from 'reselect';
import { ClustersState, RootState, FetchStatus } from 'types';

const clustersState = ({ clusters }: RootState): ClustersState => clusters;

export const getIsClusterListFetched = createSelector(clustersState, ({ fetchStatus }) => fetchStatus === FetchStatus.fetched);

export const getClusterList = createSelector(clustersState, ({ items }) => items);
