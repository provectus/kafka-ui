import { combineReducers } from 'redux';
import topics from './topics/reducer';
import clusters from './clusters/reducer';
import loader from './loader/reducer';
import { RootState } from 'types';

export default combineReducers<RootState>({
  topics,
  clusters,
  loader,
});
