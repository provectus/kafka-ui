import { connect } from 'react-redux';
import {
  ClusterName,
  RootState,
  TopicMessageQueryParams,
  TopicName,
} from 'redux/interfaces';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { fetchTopicMessages } from 'redux/actions';
import {
  getIsTopicMessagesFetched,
  getPartitionsByTopicName,
  getTopicMessages,
} from 'redux/reducers/topics/selectors';

import Messages from './Messages';

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
  clusterName,
  topicName,
  isFetched: getIsTopicMessagesFetched(state),
  messages: getTopicMessages(state),
  partitions: getPartitionsByTopicName(state, topicName),
});

const mapDispatchToProps = {
  fetchTopicMessages: (
    clusterName: ClusterName,
    topicName: TopicName,
    queryParams: Partial<TopicMessageQueryParams>
  ) => fetchTopicMessages(clusterName, topicName, queryParams),
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Messages)
);
