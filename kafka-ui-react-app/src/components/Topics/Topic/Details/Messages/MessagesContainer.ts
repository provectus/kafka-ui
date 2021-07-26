import { connect } from 'react-redux';
import { Action, ClusterName, RootState, TopicName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { ThunkDispatch } from 'redux-thunk';
import {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
} from 'redux/actions';
import { TopicMessage, TopicMessageConsuming } from 'generated-sources';
import {
  getTopicMessges,
  getTopicMessgesMeta,
  getTopicMessgesPhase,
} from 'redux/reducers/topicMessages/selectors';
import { getPartitionsByTopicName } from 'redux/reducers/topics/selectors';

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
  messages: getTopicMessges(state),
  phaseMessage: getTopicMessgesPhase(state),
  partitions: getPartitionsByTopicName(state, topicName),
  meta: getTopicMessgesMeta(state),
});

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, undefined, Action>
) => ({
  addMessage: (message: TopicMessage) => {
    dispatch(addTopicMessage(message));
  },
  resetMessages: () => {
    dispatch(resetTopicMessages());
  },
  updatePhase: (phase: string) => {
    dispatch(updateTopicMessagesPhase(phase));
  },
  updateMeta: (meta: TopicMessageConsuming) => {
    dispatch(updateTopicMessagesMeta(meta));
  },
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Messages)
);
