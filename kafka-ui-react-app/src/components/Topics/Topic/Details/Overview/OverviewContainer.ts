import { connect } from 'react-redux';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import Overview from 'components/Topics/Topic/Details/Overview/Overview';

const mapDispatchToProps = {
  clearTopicMessages,
};

export default connect(null, mapDispatchToProps)(Overview);
