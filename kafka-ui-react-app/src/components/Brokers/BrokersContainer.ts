import { connect } from 'react-redux';
import { fetchClusterStats, fetchBrokers } from 'redux/actions';
import * as brokerSelectors from 'redux/reducers/brokers/selectors';
import { RootState, ClusterName } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import Brokers from './Brokers';

interface RouteProps {
  clusterName: ClusterName;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { clusterName },
    },
  }: OwnProps
) => ({
  isFetched: brokerSelectors.getIsBrokerListFetched(state),
  clusterName,
  brokerCount: brokerSelectors.getBrokerCount(state),
  zooKeeperStatus: brokerSelectors.getZooKeeperStatus(state),
  activeControllers: brokerSelectors.getActiveControllers(state),
  onlinePartitionCount: brokerSelectors.getOnlinePartitionCount(state),
  offlinePartitionCount: brokerSelectors.getOfflinePartitionCount(state),
  inSyncReplicasCount: brokerSelectors.getInSyncReplicasCount(state),
  outOfSyncReplicasCount: brokerSelectors.getOutOfSyncReplicasCount(state),
  underReplicatedPartitionCount: brokerSelectors.getUnderReplicatedPartitionCount(
    state
  ),
});

const mapDispatchToProps = {
  fetchClusterStats: (clusterName: ClusterName) =>
    fetchClusterStats(clusterName),
  fetchBrokers: (clusterName: ClusterName) => fetchBrokers(clusterName),
};

export default connect(mapStateToProps, mapDispatchToProps)(Brokers);
