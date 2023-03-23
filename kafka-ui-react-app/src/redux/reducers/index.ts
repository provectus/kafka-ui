import { combineReducers } from '@reduxjs/toolkit';
import loader from 'redux/reducers/loader/loaderSlice';
import schemas from 'redux/reducers/schemas/schemasSlice';
import topicMessages from 'redux/reducers/topicMessages/topicMessagesSlice';
import consumerGroups from 'redux/reducers/consumerGroups/consumerGroupsSlice';

export default combineReducers({
  loader,
  topicMessages,
  consumerGroups,
  schemas,
});
