import { connect } from 'react-redux';
import { RootState, TopicName, ClusterName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { fetchTopicConsumerGroups } from 'redux/reducers/topics/topicsSlice';
import TopicConsumerGroups from 'components/Topics/Topic/Details/ConsumerGroups/TopicConsumerGroups';
import {
  getTopicConsumerGroups,
  getTopicsConsumerGroupsFetched,
} from 'redux/reducers/topics/selectors';

interface RouteProps {
  clusterName: ClusterName;
  topicName: TopicName;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { topicName, clusterName },
    },
  }: OwnProps
) => ({
  consumerGroups: getTopicConsumerGroups(state, topicName),
  topicName,
  clusterName,
  isFetched: getTopicsConsumerGroupsFetched(state),
});

const mapDispatchToProps = {
  fetchTopicConsumerGroups,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TopicConsumerGroups)
);
