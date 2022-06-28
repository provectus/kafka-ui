import { combineReducers } from '@reduxjs/toolkit';
import loader from 'redux/reducers/loader/loaderSlice';
import alerts from 'redux/reducers/alerts/alertsSlice';
import schemas from 'redux/reducers/schemas/schemasSlice';
import connect from 'redux/reducers/connect/connectSlice';
import topicMessages from 'redux/reducers/topicMessages/topicMessagesSlice';
import topics from 'redux/reducers/topics/topicsSlice';
import consumerGroups from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import ksqlDb from 'redux/reducers/ksqlDb/ksqlDbSlice';

export default combineReducers({
  loader,
  alerts,
  topics,
  topicMessages,
  consumerGroups,
  schemas,
  connect,
  ksqlDb,
});
