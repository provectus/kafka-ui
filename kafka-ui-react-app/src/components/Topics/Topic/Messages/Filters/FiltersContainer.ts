import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
  setTopicMessagesFetchingStatus,
  setMessageEventType,
  updateTopicMessagesCursor,
  setTopicMessagesCurrentPage,
  setTopicMessagesLastLoadedPage,
  resetAllTopicMessages,
} from 'redux/reducers/topicMessages/topicMessagesSlice';
import {
  getTopicMessgesMeta,
  getTopicMessgesPhase,
  getIsTopicMessagesFetching,
  getIsTopicMessagesType,
  getTopicMessgesCursor,
  getTopicMessgesCurrentPage,
} from 'redux/reducers/topicMessages/selectors';

import Filters from './Filters';

const mapStateToProps = (state: RootState) => ({
  phaseMessage: getTopicMessgesPhase(state),
  meta: getTopicMessgesMeta(state),
  isFetching: getIsTopicMessagesFetching(state),
  messageEventType: getIsTopicMessagesType(state),
  cursor: getTopicMessgesCursor(state),
  currentPage: getTopicMessgesCurrentPage(state),
});

const mapDispatchToProps = {
  addMessage: addTopicMessage,
  resetMessages: resetTopicMessages,
  updatePhase: updateTopicMessagesPhase,
  updateMeta: updateTopicMessagesMeta,
  setIsFetching: setTopicMessagesFetchingStatus,
  setMessageType: setMessageEventType,
  updateCursor: updateTopicMessagesCursor,
  setCurrentPage: setTopicMessagesCurrentPage,
  setLastLoadedPage: setTopicMessagesLastLoadedPage,
  resetAllMessages: resetAllTopicMessages,
};

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
