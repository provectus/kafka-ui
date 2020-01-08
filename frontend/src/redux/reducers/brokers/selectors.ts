import { createSelector } from 'reselect';
import { RootState, FetchStatus, BrokersState } from 'types';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const brokersState = ({ brokers }: RootState): BrokersState => brokers;

const getBrokerListFetchingStatus = createFetchingSelector('GET_BROKERS');

export const getIsBrokerListFetched = createSelector(
  getBrokerListFetchingStatus,
  (status) => status === FetchStatus.fetched,
);

const getBrokerList = createSelector(brokersState, ({ items }) => items);

export const getBrokerCount = createSelector(brokersState, ({ brokerCount }) => brokerCount);
export const getZooKeeperStatus = createSelector(brokersState, ({ zooKeeperStatus }) => zooKeeperStatus);
export const getActiveControllers = createSelector(brokersState, ({ activeControllers }) => activeControllers);
export const getNetworkPoolUsage = createSelector(brokersState, ({ networkPoolUsage }) => networkPoolUsage);
export const getRequestPoolUsage = createSelector(brokersState, ({ requestPoolUsage }) => requestPoolUsage);
export const getOnlinePartitionCount = createSelector(brokersState, ({ onlinePartitionCount }) => onlinePartitionCount);
export const getOfflinePartitionCount = createSelector(brokersState, ({ offlinePartitionCount }) => offlinePartitionCount);
export const getDiskUsageDistribution = createSelector(brokersState, ({ diskUsageDistribution }) => diskUsageDistribution);
export const getUnderReplicatedPartitionCount = createSelector(brokersState, ({ underReplicatedPartitionCount }) => underReplicatedPartitionCount);

export const getMinDiskUsage = createSelector(
  getBrokerList,
  (brokers) => {
    if (brokers.length === 0) {
      return 0;
    }

    return Math.min(...brokers.map(({ segmentSize }) => segmentSize));
  },
);

export const getMaxDiskUsage = createSelector(
  getBrokerList,
  (brokers) => {
    if (brokers.length === 0) {
      return 0;
    }

    return Math.max(...brokers.map(({ segmentSize }) => segmentSize));
  },
);
