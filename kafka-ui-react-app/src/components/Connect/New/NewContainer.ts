import { connect } from 'react-redux';
import { fetchConnects } from 'redux/reducers/connect/connectSlice';
import { RootState } from 'redux/interfaces';
import {
  getAreConnectsFetching,
  getConnects,
} from 'redux/reducers/connect/selectors';

import New from './New';

const mapStateToProps = (state: RootState) => ({
  areConnectsFetching: getAreConnectsFetching(state),
  connects: getConnects(state),
});

const mapDispatchToProps = {
  fetchConnects,
};

export default connect(mapStateToProps, mapDispatchToProps)(New);
