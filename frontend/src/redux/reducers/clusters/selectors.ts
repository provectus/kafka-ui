import { createSelector } from 'reselect';
import { ClustersState, RootState, FetchStatus } from 'types';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const clustersState = ({ clusters }: RootState): ClustersState => clusters;

const getClusterListFetchingStatus = createFetchingSelector('GET_CLUSTERS');

export const getIsClusterListFetched = createSelector(getClusterListFetchingStatus, (status) => status === FetchStatus.fetched);

export const getClusterList = createSelector(clustersState, (items) => items);
