import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
  setTopicMessagesFetchingStatus,
  setMessageEventType,
} from 'redux/reducers/topicMessages/topicMessagesSlice';
import {
  getTopicMessgesMeta,
  getTopicMessgesPhase,
  getIsTopicMessagesFetching,
  getIsTopicMessagesType,
} from 'redux/reducers/topicMessages/selectors';

import Filters from './Filters';

const mapStateToProps = (state: RootState) => ({
  phaseMessage: getTopicMessgesPhase(state),
  meta: getTopicMessgesMeta(state),
  isFetching: getIsTopicMessagesFetching(state),
  messageEventType: getIsTopicMessagesType(state),
});

const mapDispatchToProps = {
  addMessage: addTopicMessage,
  resetMessages: resetTopicMessages,
  updatePhase: updateTopicMessagesPhase,
  updateMeta: updateTopicMessagesMeta,
  setIsFetching: setTopicMessagesFetchingStatus,
  setMessageType: setMessageEventType,
};

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
