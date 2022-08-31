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
  fetchTopicSerdes,
  resetTopicMessages,
  setTopicMessagesFetchingStatus,
  setTopicSerdes,
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
  setTopicSerdes,
  fetchTopicSerdes,
};

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
