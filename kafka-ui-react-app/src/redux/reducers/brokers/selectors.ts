import { createSelector } from '@reduxjs/toolkit';
import { RootState, BrokersState } from 'redux/interfaces';

const brokersState = ({ brokers }: RootState): BrokersState => brokers;

export const getBrokerCount = createSelector(
  brokersState,
  ({ brokerCount }) => brokerCount
);
export const getZooKeeperStatus = createSelector(
  brokersState,
  ({ zooKeeperStatus }) => zooKeeperStatus
);
export const getActiveControllers = createSelector(
  brokersState,
  ({ activeControllers }) => activeControllers
);
export const getOnlinePartitionCount = createSelector(
  brokersState,
  ({ onlinePartitionCount }) => onlinePartitionCount
);
export const getOfflinePartitionCount = createSelector(
  brokersState,
  ({ offlinePartitionCount }) => offlinePartitionCount
);
export const getInSyncReplicasCount = createSelector(
  brokersState,
  ({ inSyncReplicasCount }) => inSyncReplicasCount
);
export const getOutOfSyncReplicasCount = createSelector(
  brokersState,
  ({ outOfSyncReplicasCount }) => outOfSyncReplicasCount
);
export const getUnderReplicatedPartitionCount = createSelector(
  brokersState,
  ({ underReplicatedPartitionCount }) => underReplicatedPartitionCount
);

export const getDiskUsage = createSelector(
  brokersState,
  ({ diskUsage }) => diskUsage
);

export const getVersion = createSelector(
  brokersState,
  ({ version }) => version
);
