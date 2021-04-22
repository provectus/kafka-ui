import { connect } from 'react-redux';
import { fetchClusterStats, fetchBrokers } from 'redux/actions';
import { RootState } from 'redux/interfaces';
import {
  getIsBrokerListFetched,
  getBrokerCount,
  getZooKeeperStatus,
  getActiveControllers,
  getOnlinePartitionCount,
  getOfflinePartitionCount,
  getInSyncReplicasCount,
  getOutOfSyncReplicasCount,
  getUnderReplicatedPartitionCount,
  getDiskUsage,
} from 'redux/reducers/brokers/selectors';
import Brokers from 'components/Brokers/Brokers';

const mapStateToProps = (state: RootState) => ({
  isFetched: getIsBrokerListFetched(state),
  brokerCount: getBrokerCount(state),
  zooKeeperStatus: getZooKeeperStatus(state),
  activeControllers: getActiveControllers(state),
  onlinePartitionCount: getOnlinePartitionCount(state),
  offlinePartitionCount: getOfflinePartitionCount(state),
  inSyncReplicasCount: getInSyncReplicasCount(state),
  outOfSyncReplicasCount: getOutOfSyncReplicasCount(state),
  underReplicatedPartitionCount: getUnderReplicatedPartitionCount(state),
  diskUsage: getDiskUsage(state),
});

const mapDispatchToProps = {
  fetchClusterStats,
  fetchBrokers,
};

export default connect(mapStateToProps, mapDispatchToProps)(Brokers);
