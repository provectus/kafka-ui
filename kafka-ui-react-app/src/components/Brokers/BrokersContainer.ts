import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getAreBrokersFulfilled,
  getBrokerCount,
  getZooKeeperStatus,
  getActiveControllers,
  getOnlinePartitionCount,
  getOfflinePartitionCount,
  getInSyncReplicasCount,
  getOutOfSyncReplicasCount,
  getUnderReplicatedPartitionCount,
  getDiskUsage,
  getVersion,
} from 'redux/reducers/brokers/selectors';
import Brokers from 'components/Brokers/Brokers';
import {
  fetchClusterStats,
  fetchBrokers,
} from 'redux/reducers/brokers/brokersSlice';

const mapStateToProps = (state: RootState) => ({
  isFetched: getAreBrokersFulfilled(state),
  brokerCount: getBrokerCount(state),
  zooKeeperStatus: getZooKeeperStatus(state),
  activeControllers: getActiveControllers(state),
  onlinePartitionCount: getOnlinePartitionCount(state),
  offlinePartitionCount: getOfflinePartitionCount(state),
  inSyncReplicasCount: getInSyncReplicasCount(state),
  outOfSyncReplicasCount: getOutOfSyncReplicasCount(state),
  underReplicatedPartitionCount: getUnderReplicatedPartitionCount(state),
  diskUsage: getDiskUsage(state),
  version: getVersion(state),
});

const mapDispatchToProps = {
  fetchClusterStats,
  fetchBrokers,
};

export default connect(mapStateToProps, mapDispatchToProps)(Brokers);
