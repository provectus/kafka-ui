import { combineReducers } from '@reduxjs/toolkit';
import clusters from 'redux/reducers/clusters/clustersSlice';
import loader from 'redux/reducers/loader/loaderSlice';

import topics from './topics/reducer';
import topicMessages from './topicMessages/reducer';
import brokers from './brokers/reducer';
import consumerGroups from './consumerGroups/reducer';
import schemas from './schemas/reducer';
import connect from './connect/reducer';
import alerts from './alerts/reducer';
import ksqlDb from './ksqlDb/reducer';
import legacyLoader from './loader/reducer';

export default combineReducers({
  topics,
  topicMessages,
  clusters,
  brokers,
  consumerGroups,
  schemas,
  connect,
  legacyLoader,
  loader,
  alerts,
  ksqlDb,
});
