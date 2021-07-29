import { connect } from 'react-redux';
import { Action, ClusterName, RootState, TopicName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { ThunkDispatch } from 'redux-thunk';
import {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
  setTopicMessagesFetchingStatus,
} from 'redux/actions';
import { TopicMessage, TopicMessageConsuming } from 'generated-sources';
import {
  getTopicMessgesMeta,
  getTopicMessgesPhase,
  getIsTopicMessagesFetching,
} from 'redux/reducers/topicMessages/selectors';
import { getPartitionsByTopicName } from 'redux/reducers/topics/selectors';

import Filters from './Filters';

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
  phaseMessage: getTopicMessgesPhase(state),
  partitions: getPartitionsByTopicName(state, topicName),
  meta: getTopicMessgesMeta(state),
  isFetching: getIsTopicMessagesFetching(state),
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
  setIsFetching: (status: boolean) => {
    dispatch(setTopicMessagesFetchingStatus(status));
  },
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Filters)
);
