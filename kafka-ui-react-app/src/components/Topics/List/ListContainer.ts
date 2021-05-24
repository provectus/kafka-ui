import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  fetchTopicsList,
  deleteTopic,
  clearTopicMessages,
  setTopicsSearchAction,
  setTopicsOrderByAction,
} from 'redux/actions';
import {
  getTopicList,
  getExternalTopicList,
  getAreTopicsFetching,
  getTopicListTotalPages,
  getTopicsSearch,
  getTopicsOrderBy,
} from 'redux/reducers/topics/selectors';

import List from './List';

const mapStateToProps = (state: RootState) => ({
  areTopicsFetching: getAreTopicsFetching(state),
  topics: getTopicList(state),
  externalTopics: getExternalTopicList(state),
  totalPages: getTopicListTotalPages(state),
  search: getTopicsSearch(state),
  orderBy: getTopicsOrderBy(state),
});

const mapDispatchToProps = {
  fetchTopicsList,
  deleteTopic,
  clearTopicMessages,
  setTopicsSearch: setTopicsSearchAction,
  setTopicsOrderBy: setTopicsOrderByAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
