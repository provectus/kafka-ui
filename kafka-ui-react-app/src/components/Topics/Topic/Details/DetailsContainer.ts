import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { deleteTopic, recreateTopic } from 'redux/reducers/topics/topicsSlice';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import { getIsTopicDeleted } from 'redux/reducers/topics/selectors';

import Details from './Details';

const mapStateToProps = (state: RootState) => ({
  isDeleted: getIsTopicDeleted(state),
});

const mapDispatchToProps = {
  recreateTopic,
  deleteTopic,
  clearTopicMessages,
};

export default connect(mapStateToProps, mapDispatchToProps)(Details);
