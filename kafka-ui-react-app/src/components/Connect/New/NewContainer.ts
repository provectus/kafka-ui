import { connect } from 'react-redux';
import {
  createConnector,
  fetchConnects,
} from 'redux/reducers/connect/connectSlice';
import { RootState } from 'redux/interfaces';
import {
  getAreConnectsFetching,
  getConnects,
} from 'redux/reducers/connect/selectors';

import New, { NewProps } from './New';

const mapStateToProps = (state: RootState) => ({
  areConnectsFetching: getAreConnectsFetching(state),
  connects: getConnects(state),
});

const mapDispatchToProps = {
  fetchConnects,
  createConnector: createConnector as unknown as NewProps['createConnector'],
};

export default connect(mapStateToProps, mapDispatchToProps)(New);
