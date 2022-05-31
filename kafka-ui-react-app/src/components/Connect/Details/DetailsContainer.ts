import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  fetchConnector,
  fetchConnectorTasks,
} from 'redux/reducers/connect/connectSlice';
import {
  getIsConnectorFetching,
  getAreConnectorTasksFetching,
  getConnector,
  getConnectorTasks,
} from 'redux/reducers/connect/selectors';

import Details from './Details';

const mapStateToProps = (state: RootState) => ({
  isConnectorFetching: getIsConnectorFetching(state),
  connector: getConnector(state),
  areTasksFetching: getAreConnectorTasksFetching(state),
  tasks: getConnectorTasks(state),
});

const mapDispatchToProps = {
  fetchConnector,
  fetchTasks: fetchConnectorTasks,
};

export default connect(mapStateToProps, mapDispatchToProps)(Details);
