import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import {
  deleteConnector,
  restartConnector,
  pauseConnector,
  resumeConnector,
} from 'redux/actions';
import {
  getIsConnectorDeleting,
  getConnectorStatus,
  getIsConnectorActionRunning,
} from 'redux/reducers/connect/selectors';

import Actions from './Actions';

const mapStateToProps = (state: RootState) => ({
  isConnectorDeleting: getIsConnectorDeleting(state),
  connectorStatus: getConnectorStatus(state),
  isConnectorActionRunning: getIsConnectorActionRunning(state),
});

const mapDispatchToProps = {
  deleteConnector,
  restartConnector,
  pauseConnector,
  resumeConnector,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Actions)
);
