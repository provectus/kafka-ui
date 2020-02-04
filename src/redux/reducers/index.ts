import { combineReducers } from 'redux';
import topics from './topics/reducer';
import clusters from './clusters/reducer';
import brokers from './brokers/reducer';
import loader from './loader/reducer';
import { RootState } from 'redux/interfaces';

export default combineReducers<RootState>({
  topics,
  clusters,
  brokers,
  loader,
});
