import { connect } from 'react-redux';
import { Task } from 'generated-sources';
import { RootState } from 'redux/interfaces';
import { restartConnectorTask } from 'redux/reducers/connect/connectSlice';

import ListItem from './ListItem';

interface OwnProps {
  task: Task;
}

const mapStateToProps = (_state: RootState, { task }: OwnProps) => ({
  task,
});

const mapDispatchToProps = {
  restartTask: restartConnectorTask,
};

export default connect(mapStateToProps, mapDispatchToProps)(ListItem);
