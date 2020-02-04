import { connect } from 'react-redux';
import {
  fetchClustersList,
} from 'redux/actions';
import App from './App';
import { getIsClusterListFetched } from 'redux/reducers/clusters/selectors';
import { RootState } from 'redux/interfaces';

const mapStateToProps = (state: RootState) => ({
  isClusterListFetched: getIsClusterListFetched(state),
});

const mapDispatchToProps = {
  fetchClustersList,
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
