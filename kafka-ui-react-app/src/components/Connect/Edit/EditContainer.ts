import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  fetchConnectorConfig,
  updateConnectorConfig,
} from 'redux/reducers/connect/connectSlice';
import {
  getConnectorConfig,
  getIsConnectorConfigFetching,
} from 'redux/reducers/connect/selectors';

import Edit from './Edit';

const mapStateToProps = (state: RootState) => ({
  isConfigFetching: getIsConnectorConfigFetching(state),
  config: getConnectorConfig(state),
});

const mapDispatchToProps = {
  fetchConfig: fetchConnectorConfig,
  updateConfig: updateConnectorConfig,
};

export default connect(mapStateToProps, mapDispatchToProps)(Edit);
