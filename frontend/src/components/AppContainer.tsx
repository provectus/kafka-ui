import { connect } from 'react-redux';
import {
  fetchClustersList,
} from 'redux/reducers/clusters/thunks';
import App from './App';
import { getIsClusterListFetched } from 'redux/reducers/clusters/selectors';
import { RootState } from 'types';

const mapStateToProps = (state: RootState) => ({
  isClusterListFetched: getIsClusterListFetched(state),
});

const mapDispatchToProps = {
  fetchClustersList,
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
