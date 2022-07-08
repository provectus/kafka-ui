import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchTopicConsumerGroups } from 'redux/reducers/topics/topicsSlice';
import TopicConsumerGroups from 'components/Topics/Topic/Details/ConsumerGroups/TopicConsumerGroups';
import { getTopicsConsumerGroupsFetched } from 'redux/reducers/topics/selectors';

const mapStateToProps = (state: RootState) => ({
  isFetched: getTopicsConsumerGroupsFetched(state),
});

const mapDispatchToProps = {
  fetchTopicConsumerGroups,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TopicConsumerGroups);
