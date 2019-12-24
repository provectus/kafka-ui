import { connect } from 'react-redux';
import {
  getTopicList,
  getTotalBrokers,
} from 'redux/reducers/topics/selectors';
import { RootState } from 'types';

import List from './List';

const mapStateToProps = (state: RootState) => ({
  topics: getTopicList(state),
  totalBrokers: getTotalBrokers(state),
});

export default connect(mapStateToProps)(List);
