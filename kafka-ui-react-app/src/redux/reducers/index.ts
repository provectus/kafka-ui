import { combineReducers } from '@reduxjs/toolkit';
import clusters from 'redux/reducers/clusters/clustersSlice';
import loader from 'redux/reducers/loader/loaderSlice';
import brokers from 'redux/reducers/brokers/brokersSlice';
import alerts from 'redux/reducers/alerts/alertsSlice';
import schemas from 'redux/reducers/schemas/schemasSlice';
import connect from 'redux/reducers/connect/connectSlice';

import topicMessages from './topicMessages/topicMessagesSlice';
import topics from './topics/topicsSlice';
import consumerGroups from './consumerGroups/consumerGroupsSlice';
import ksqlDb from './ksqlDb/ksqlDbSlice';
import legacyLoader from './loader/reducer';

export default combineReducers({
  loader,
  alerts,
  topics,
  topicMessages,
  clusters,
  brokers,
  consumerGroups,
  schemas,
  connect,
  ksqlDb,
  legacyLoader,
});
