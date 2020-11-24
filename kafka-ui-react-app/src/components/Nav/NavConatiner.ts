import { connect } from 'react-redux';
import {
  getIsClusterListFetched,
  getClusterList,
} from 'redux/reducers/clusters/selectors';
import { RootState } from 'redux/interfaces';
import Nav from './Nav';

const mapStateToProps = (state: RootState) => ({
  isClusterListFetched: getIsClusterListFetched(state),
  clusters: getClusterList(state),
});

export default connect(mapStateToProps)(Nav);
