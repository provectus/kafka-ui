import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Task } from 'generated-sources';
import { RootState } from 'redux/interfaces';
import { restartConnectorTask } from 'redux/actions';

import ListItem from './ListItem';

interface OwnProps extends RouteComponentProps {
  task: Task;
}

const mapStateToProps = (_state: RootState, { task }: OwnProps) => ({
  task,
});

const mapDispatchToProps = {
  restartTask: restartConnectorTask,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ListItem)
);
