import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchTopicDetails, resetTopicMessages } from 'redux/actions';
import { getIsTopicDetailsFetching } from 'redux/reducers/topics/selectors';

import Topic from './Topic';

const mapStateToProps = (state: RootState) => ({
  isTopicFetching: getIsTopicDetailsFetching(state),
});

const mapDispatchToProps = {
  fetchTopicDetails,
  resetTopicMessages,
};

export default connect(mapStateToProps, mapDispatchToProps)(Topic);
