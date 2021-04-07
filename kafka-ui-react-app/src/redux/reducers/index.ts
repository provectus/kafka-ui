import { combineReducers } from 'redux';
import { RootState } from 'redux/interfaces';
import topics from './topics/reducer';
import clusters from './clusters/reducer';
import brokers from './brokers/reducer';
import consumerGroups from './consumerGroups/reducer';
import schemas from './schemas/reducer';
import connect from './connect/reducer';
import loader from './loader/reducer';
import alerts from './alerts/reducer';

export default combineReducers<RootState>({
  topics,
  clusters,
  brokers,
  consumerGroups,
  schemas,
  connect,
  loader,
  alerts,
});
