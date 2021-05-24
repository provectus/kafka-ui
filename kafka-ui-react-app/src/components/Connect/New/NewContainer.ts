import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createConnector, fetchConnects } from 'redux/actions';
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
  createConnector,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(New));
