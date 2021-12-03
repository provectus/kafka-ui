import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { Cluster, ClusterFeaturesEnum, ServerStatus } from 'generated-sources';

const clustersState = ({ clusters }: RootState): Cluster[] => clusters;

const getClusterListFetchingStatus = createFetchingSelector('GET_CLUSTERS');

export const getIsClusterListFetched = createSelector(
  getClusterListFetchingStatus,
  (status) => status === 'fetched'
);

export const getClusterList = createSelector(
  clustersState,
  (clusters) => clusters
);

export const getOnlineClusters = createSelector(getClusterList, (clusters) =>
  clusters.filter(({ status }) => status === ServerStatus.ONLINE)
);

export const getOfflineClusters = createSelector(getClusterList, (clusters) =>
  clusters.filter(({ status }) => status === ServerStatus.OFFLINE)
);

export const getClustersReadonlyStatus = (clusterName: string) =>
  createSelector(
    getClusterList,
    (clusters): boolean =>
      clusters.find(({ name }) => name === clusterName)?.readOnly || false
  );

export const getClustersFeatures = (clusterName: string) =>
  createSelector(
    getClusterList,
    (clusters): ClusterFeaturesEnum[] =>
      clusters.find(({ name }) => name === clusterName)?.features || []
  );
