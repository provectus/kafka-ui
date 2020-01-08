import { connect } from 'react-redux';
import {
  fetchBrokers,
  fetchBrokerMetrics,
} from 'redux/reducers/brokers/thunks';
import Brokers from './Brokers';
import * as brokerSelectors from 'redux/reducers/brokers/selectors';
import { RootState, ClusterId } from 'types';
import { RouteComponentProps } from 'react-router-dom';

interface RouteProps {
  clusterId: string;
}

interface OwnProps extends RouteComponentProps<RouteProps> { }

const mapStateToProps = (state: RootState, { match: { params: { clusterId } }}: OwnProps) => ({
  isFetched: brokerSelectors.getIsBrokerListFetched(state),
  clusterId,
  brokerCount: brokerSelectors.getBrokerCount(state),
  zooKeeperStatus: brokerSelectors.getZooKeeperStatus(state),
  activeControllers: brokerSelectors.getActiveControllers(state),
  networkPoolUsage: brokerSelectors.getNetworkPoolUsage(state),
  requestPoolUsage: brokerSelectors.getRequestPoolUsage(state),
  onlinePartitionCount: brokerSelectors.getOnlinePartitionCount(state),
  offlinePartitionCount: brokerSelectors.getOfflinePartitionCount(state),
  underReplicatedPartitionCount: brokerSelectors.getUnderReplicatedPartitionCount(state),
  diskUsageDistribution: brokerSelectors.getDiskUsageDistribution(state),
  minDiskUsage: brokerSelectors.getMinDiskUsage(state),
  maxDiskUsage: brokerSelectors.getMaxDiskUsage(state),
});

const mapDispatchToProps = {
  fetchBrokers: (clusterId: ClusterId) => fetchBrokers(clusterId),
  fetchBrokerMetrics: (clusterId: ClusterId) => fetchBrokerMetrics(clusterId),
}

export default connect(mapStateToProps, mapDispatchToProps)(Brokers);
