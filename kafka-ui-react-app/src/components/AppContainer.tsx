import { connect } from 'react-redux';
import {
  getClusterList,
  getAreClustersFulfilled,
} from 'redux/reducers/clusters/clustersSlice';
import { getAlerts } from 'redux/reducers/alerts/selectors';
import { RootState } from 'redux/interfaces';
import App from 'components/App';

const mapStateToProps = (state: RootState) => ({
  isClusterListFetched: getAreClustersFulfilled(state),
  alerts: getAlerts(state),
  clusters: getClusterList(state),
});

export default connect(mapStateToProps)(App);
