import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchTopicDetails } from 'redux/actions';
import { getIsTopicDetailsFetching } from 'redux/reducers/topics/selectors';
import Topic from './Topic';

const mapStateToProps = (state: RootState) => ({
  isTopicFetching: getIsTopicDetailsFetching(state),
});

const mapDispatchToProps = {
  fetchTopicDetails,
};

export default connect(mapStateToProps, mapDispatchToProps)(Topic);
