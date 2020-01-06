import { connect } from 'react-redux';
import { RootState } from 'types';
import { getTopicList, getExternalTopicList } from 'redux/reducers/topics/selectors';
import List from './List';

const mapStateToProps = (state: RootState) => ({
  topics: getTopicList(state),
  externalTopics: getExternalTopicList(state),
});


export default connect(mapStateToProps)(List);
