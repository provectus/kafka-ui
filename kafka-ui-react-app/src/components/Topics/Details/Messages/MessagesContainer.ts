import { connect } from 'react-redux';
import { ClusterName, RootState, TopicName } from 'redux/interfaces';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { fetchTopicMessages } from 'redux/actions';
import {
  getIsTopicMessagesFetched,
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
});

const mapDispatchToProps = {
  fetchTopicMessages: (clusterName: ClusterName, topicName: TopicName) =>
    fetchTopicMessages(clusterName, topicName),
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Messages)
);
