import { connect } from 'react-redux';
import Nav from './Nav';
import { getIsClusterListFetched, getClusterList } from 'redux/reducers/clusters/selectors';
import { RootState } from 'redux/interfaces';

const mapStateToProps = (state: RootState) => ({
  isClusterListFetched: getIsClusterListFetched(state),
  clusters: getClusterList(state),
});

export default connect(mapStateToProps)(Nav);
