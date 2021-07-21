import { connect } from 'react-redux';
import { RootState, ClusterName, TopicName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { fetchTopicMessageSchema, sendTopicMessage } from 'redux/actions';
import {
  getMessageSchemaByTopicName,
  getPartitionsByTopicName,
  getTopicMessageSchemaFetched,
  getTopicMessageSending,
  getTopicMessageSent,
} from 'redux/reducers/topics/selectors';

import SendMessage from './SendMessage';

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
  messageSchema: getMessageSchemaByTopicName(state, topicName),
  schemaIsFetched: getTopicMessageSchemaFetched(state),
  messageIsSent: getTopicMessageSent(state),
  messageIsSending: getTopicMessageSending(state),
  partitions: getPartitionsByTopicName(state, topicName),
});

const mapDispatchToProps = {
  fetchTopicMessageSchema,
  sendTopicMessage,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SendMessage)
);
