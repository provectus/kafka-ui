import { connect } from 'react-redux';
import { RootState, TopicName, ClusterName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { fetchTopicConsumerGroups } from 'redux/actions';
import TopicConsumerGroups from 'components/Topics/Topic/Details/ConsumerGroups/ConsumerGroups';
import { getTopicConsumerGroups } from 'redux/reducers/topics/selectors';

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
) => {
  return {
    consumerGroups: getTopicConsumerGroups(state),
    topicName,
    clusterName,
  };
};

const mapDispatchToProps = {
  fetchTopicConsumerGroups,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TopicConsumerGroups)
);
