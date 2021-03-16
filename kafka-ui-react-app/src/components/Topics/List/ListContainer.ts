import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchTopicsList } from 'redux/actions';
import {
  getTopicList,
  getExternalTopicList,
  getAreTopicsFetching,
  getTopicListTotalPages,
} from 'redux/reducers/topics/selectors';
import List from './List';

const mapStateToProps = (state: RootState) => ({
  areTopicsFetching: getAreTopicsFetching(state),
  topics: getTopicList(state),
  externalTopics: getExternalTopicList(state),
  totalPages: getTopicListTotalPages(state),
});

const mapDispatchToProps = {
  fetchTopicsList,
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
