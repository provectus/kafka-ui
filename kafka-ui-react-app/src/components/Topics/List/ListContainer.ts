import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { clearTopicMessages } from 'redux/reducers/topicMessages/topicMessagesSlice';
import {
  fetchTopicsList,
  deleteTopic,
  recreateTopic,
  setTopicsSearch,
  setTopicsOrderBy,
  deleteTopics,
  clearTopicsMessages,
} from 'redux/reducers/topics/topicsSlice';
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
  setTopicsSearch,
  setTopicsOrderBy,
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
