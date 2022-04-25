import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  fetchTopicsList,
  deleteTopic,
  deleteTopics,
  recreateTopic,
  clearTopicsMessages,
  setTopicsSearchAction,
  setTopicsOrderByAction,
} from 'redux/actions';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import {
  getTopicList,
  getAreTopicsFetching,
  getTopicListTotalPages,
  getTopicsSearch,
  getTopicsOrderBy,
  getTopicsSortOrder,
} from 'redux/reducers/topics/selectors';

import List from './List';

const mapStateToProps = (state: RootState) => ({
  areTopicsFetching: getAreTopicsFetching(state),
  topics: getTopicList(state),
  totalPages: getTopicListTotalPages(state),
  search: getTopicsSearch(state),
  orderBy: getTopicsOrderBy(state),
  sortOrder: getTopicsSortOrder(state),
});

const mapDispatchToProps = {
  fetchTopicsList,
  deleteTopic,
  deleteTopics,
  recreateTopic,
  clearTopicsMessages,
  clearTopicMessages,
  setTopicsSearch: setTopicsSearchAction,
  setTopicsOrderBy: setTopicsOrderByAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
