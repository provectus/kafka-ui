import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
} from 'redux/reducers/topics/topicsSlice';

import DangerZone from './DangerZone';

type OwnProps = {
  defaultPartitions: number;
  defaultReplicationFactor: number;
};

const mapStateToProps = (
  _: RootState,
  { defaultPartitions, defaultReplicationFactor }: OwnProps
) => ({
  defaultPartitions,
  defaultReplicationFactor,
});

const mapDispatchToProps = {
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
};

export default connect(mapStateToProps, mapDispatchToProps)(DangerZone);
