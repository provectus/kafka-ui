import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  fetchConnects,
  fetchConnectors,
} from 'redux/actions/thunks/connectors';
import {
  getConnects,
  getConnectors,
  getAreConnectsFetching,
  getAreConnectorsFetching,
} from 'redux/reducers/connect/selectors';
import List from './List';

const mapStateToProps = (state: RootState) => ({
  areConnectsFetching: getAreConnectsFetching(state),
  areConnectorsFetching: getAreConnectorsFetching(state),

  connects: getConnects(state),
  connectors: getConnectors(state),
});

const mapDispatchToProps = {
  fetchConnects,
  fetchConnectors,
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
