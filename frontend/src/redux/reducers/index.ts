import { combineReducers } from 'redux';
import topics from './topics/reducer';
import { RootState } from 'types';

export default combineReducers<RootState>({
  topics,
});
