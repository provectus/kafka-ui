import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  updateTopic,
  fetchTopicConfig,
} from 'redux/reducers/topics/topicsSlice';
import {
  getTopicConfigFetched,
  getTopicUpdated,
} from 'redux/reducers/topics/selectors';

import Edit from './Edit';

const mapStateToProps = (state: RootState) => ({
  isFetched: getTopicConfigFetched(state),
  isTopicUpdated: getTopicUpdated(state),
});

const mapDispatchToProps = {
  fetchTopicConfig,
  updateTopic,
};

export default connect(mapStateToProps, mapDispatchToProps)(Edit);
