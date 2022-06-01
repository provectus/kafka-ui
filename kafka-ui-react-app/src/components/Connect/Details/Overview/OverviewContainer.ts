import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getConnector,
  getConnectorRunningTasksCount,
  getConnectorFailedTasksCount,
} from 'redux/reducers/connect/selectors';

import Overview from './Overview';

const mapStateToProps = (state: RootState) => ({
  connector: getConnector(state),
  runningTasksCount: getConnectorRunningTasksCount(state),
  failedTasksCount: getConnectorFailedTasksCount(state),
});

export default connect(mapStateToProps)(Overview);
