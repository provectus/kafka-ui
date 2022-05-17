import { connect } from 'react-redux';
import { RootState, TopicName, ClusterName } from 'redux/interfaces';
import { getTopicByName } from 'redux/reducers/topics/selectors';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import Overview from 'components/Topics/Topic/Details/Overview/Overview';

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
  ...getTopicByName(state, topicName),
  topicName,
  clusterName,
});

const mapDispatchToProps = {
  clearTopicMessages,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Overview)
);
