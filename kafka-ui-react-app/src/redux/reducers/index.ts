import { combineReducers } from '@reduxjs/toolkit';
import clusters from 'redux/reducers/clusters/clustersSlice';
import loader from 'redux/reducers/loader/loaderSlice';
import brokers from 'redux/reducers/brokers/brokersSlice';
import alerts from 'redux/reducers/alerts/alertsSlice';
import schemas from 'redux/reducers/schemas/schemasSlice';

import topics from './topics/reducer';
import topicMessages from './topicMessages/reducer';
import consumerGroups from './consumerGroups/consumerGroupsSlice';
import connect from './connect/reducer';
import ksqlDb from './ksqlDb/ksqlDbSlice';
import legacyLoader from './loader/reducer';
import legacyAlerts from './alerts/reducer';

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
  legacyAlerts,
});
