import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getIsTopicMessagesFetching,
  getTopicMessgesMeta,
  getTopicMessgesPhase,
  getTopicSerdes,
} from 'redux/reducers/topicMessages/selectors';
import {
  addTopicMessage,
  resetTopicMessages,
  setTopicMessagesFetchingStatus,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
} from 'redux/reducers/topicMessages/topicMessagesSlice';

import Filters from './Filters';

const mapStateToProps = (state: RootState) => ({
  phaseMessage: getTopicMessgesPhase(state),
  meta: getTopicMessgesMeta(state),
  isFetching: getIsTopicMessagesFetching(state),
  serdes: getTopicSerdes(state),
});

const mapDispatchToProps = {
  addMessage: addTopicMessage,
  resetMessages: resetTopicMessages,
  updatePhase: updateTopicMessagesPhase,
  updateMeta: updateTopicMessagesMeta,
  setIsFetching: setTopicMessagesFetchingStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
