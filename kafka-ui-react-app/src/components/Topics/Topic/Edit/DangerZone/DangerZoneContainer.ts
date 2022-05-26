import { connect } from 'react-redux';
import { RootState, ClusterName, TopicName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
} from 'redux/reducers/topics/topicsSlice';
import {
  getTopicPartitionsCountIncreased,
  getTopicReplicationFactorUpdated,
} from 'redux/reducers/topics/selectors';

import DangerZone from './DangerZone';

interface RouteProps {
  clusterName: ClusterName;
  topicName: TopicName;
}

type OwnProps = {
  defaultPartitions: number;
  defaultReplicationFactor: number;
};

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { topicName, clusterName },
    },
    defaultPartitions,
    defaultReplicationFactor,
  }: OwnProps & RouteComponentProps<RouteProps>
) => ({
  clusterName,
  topicName,
  defaultPartitions,
  defaultReplicationFactor,
  partitionsCountIncreased: getTopicPartitionsCountIncreased(state),
  replicationFactorUpdated: getTopicReplicationFactorUpdated(state),
});

const mapDispatchToProps = {
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DangerZone)
);
