import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
  setTopicMessagesFetchingStatus,
} from 'redux/reducers/topicMessages/topicMessagesSlice';
import {
  getTopicMessgesMeta,
  getTopicMessgesPhase,
  getIsTopicMessagesFetching,
} from 'redux/reducers/topicMessages/selectors';

import Filters from './Filters';

const mapStateToProps = (state: RootState) => ({
  phaseMessage: getTopicMessgesPhase(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
