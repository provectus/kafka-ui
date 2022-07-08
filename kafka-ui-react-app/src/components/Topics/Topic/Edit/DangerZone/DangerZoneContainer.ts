import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
} from 'redux/reducers/topics/topicsSlice';
import {
  getTopicPartitionsCountIncreased,
  getTopicReplicationFactorUpdated,
} from 'redux/reducers/topics/selectors';

import DangerZone from './DangerZone';

type OwnProps = {
  defaultPartitions: number;
  defaultReplicationFactor: number;
};

const mapStateToProps = (
  state: RootState,
  { defaultPartitions, defaultReplicationFactor }: OwnProps
) => ({
  defaultPartitions,
  defaultReplicationFactor,
  partitionsCountIncreased: getTopicPartitionsCountIncreased(state),
  replicationFactorUpdated: getTopicReplicationFactorUpdated(state),
});

const mapDispatchToProps = {
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
};

export default connect(mapStateToProps, mapDispatchToProps)(DangerZone);
