import { connect } from 'react-redux';
import {
  fetchBrokers,
  fetchBrokerMetrics,
} from 'redux/actions';
import Brokers from './Brokers';
import * as brokerSelectors from 'redux/reducers/brokers/selectors';
import { RootState, ClusterName } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterName: ClusterName;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterName } }}: OwnProps) => ({
  isFetched: brokerSelectors.getIsBrokerListFetched(state),
  clusterName,
  brokerCount: brokerSelectors.getBrokerCount(state),
  zooKeeperStatus: brokerSelectors.getZooKeeperStatus(state),
  activeControllers: brokerSelectors.getActiveControllers(state),
  networkPoolUsage: brokerSelectors.getNetworkPoolUsage(state),
  requestPoolUsage: brokerSelectors.getRequestPoolUsage(state),
  onlinePartitionCount: brokerSelectors.getOnlinePartitionCount(state),
  offlinePartitionCount: brokerSelectors.getOfflinePartitionCount(state),
  inSyncReplicasCount: brokerSelectors.getInSyncReplicasCount(state),
  outOfSyncReplicasCount: brokerSelectors.getOutOfSyncReplicasCount(state),
  underReplicatedPartitionCount: brokerSelectors.getUnderReplicatedPartitionCount(state),
  diskUsageDistribution: brokerSelectors.getDiskUsageDistribution(state),
  minDiskUsage: brokerSelectors.getMinDiskUsage(state),
  maxDiskUsage: brokerSelectors.getMaxDiskUsage(state),
});

const mapDispatchToProps = {
  fetchBrokers: (clusterName: ClusterName) => fetchBrokers(clusterName),
  fetchBrokerMetrics: (clusterName: ClusterName) => fetchBrokerMetrics(clusterName),
};

export default connect(mapStateToProps, mapDispatchToProps)(Brokers);
