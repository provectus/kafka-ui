import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  fetchConnects,
  fetchConnectors,
  setConnectorSearch,
} from 'redux/reducers/connect/connectSlice';
import {
  getConnects,
  getConnectors,
  getAreConnectsFetching,
  getAreConnectorsFetching,
  getConnectorSearch,
} from 'redux/reducers/connect/selectors';
import List from 'components/Connect/List/List';

const mapStateToProps = (state: RootState) => ({
  areConnectsFetching: getAreConnectsFetching(state),
  areConnectorsFetching: getAreConnectorsFetching(state),
  connects: getConnects(state),
  connectors: getConnectors(state),
  search: getConnectorSearch(state),
});

const mapDispatchToProps = {
  fetchConnects,
  fetchConnectors,
  setConnectorSearch,
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
