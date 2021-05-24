import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import { fetchConnectorConfig } from 'redux/actions';
import {
  getIsConnectorConfigFetching,
  getConnectorConfig,
} from 'redux/reducers/connect/selectors';

import Config from './Config';

const mapStateToProps = (state: RootState) => ({
  isConfigFetching: getIsConnectorConfigFetching(state),
  config: getConnectorConfig(state),
});

const mapDispatchToProps = {
  fetchConfig: fetchConnectorConfig,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Config));
