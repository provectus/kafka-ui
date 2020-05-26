import { createSelector } from 'reselect';
import { RootState, FetchStatus, BrokersState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const brokersState = ({ brokers }: RootState): BrokersState => brokers;

const getBrokerListFetchingStatus = createFetchingSelector('GET_BROKERS');

export const getIsBrokerListFetched = createSelector(
  getBrokerListFetchingStatus,
  (status) => status === FetchStatus.fetched
);

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
