import { connect } from 'react-redux';
import { fetchClustersList } from 'redux/actions';
import {
  getClusterList,
  getIsClusterListFetched,
} from 'redux/reducers/clusters/selectors';
import { getAlerts } from 'redux/reducers/alerts/selectors';
import { RootState } from 'redux/interfaces';
import App from './App';

const mapStateToProps = (state: RootState) => ({
  isClusterListFetched: getIsClusterListFetched(state),
  alerts: getAlerts(state),
  clusters: getClusterList(state),
});

const mapDispatchToProps = {
  fetchClustersList,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
