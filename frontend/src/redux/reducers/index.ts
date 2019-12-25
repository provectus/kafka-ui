import { combineReducers } from 'redux';
import topics from './topics/reducer';
import clusters from './clusters/reducer';
import { RootState } from 'types';

export default combineReducers<RootState>({
  topics,
  clusters,
});
