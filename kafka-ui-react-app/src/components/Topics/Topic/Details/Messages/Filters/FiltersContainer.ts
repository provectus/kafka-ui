import { connect } from 'react-redux';
import { ClusterName, RootState, TopicName } from 'redux/interfaces';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
  setTopicMessagesFetchingStatus,
} from 'redux/actions';
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

const mapDispatchToProps = {
  addMessage: addTopicMessage,
  resetMessages: resetTopicMessages,
  updatePhase: updateTopicMessagesPhase,
  updateMeta: updateTopicMessagesMeta,
  setIsFetching: setTopicMessagesFetchingStatus,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Filters)
);
