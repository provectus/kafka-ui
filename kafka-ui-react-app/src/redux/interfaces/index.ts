import { ActionType } from 'typesafe-actions';
import { ThunkAction } from 'redux-thunk';
import * as actions from 'redux/actions/actions';
import rootReducer from 'redux/reducers';
import { store } from 'redux/store';

export * from './topic';
export * from './cluster';
export * from './broker';
export * from './consumerGroup';
export * from './schema';
export * from './loader';
export * from './alerts';
export * from './connect';

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type Action = ActionType<typeof actions>;

export type ThunkResult<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  undefined,
  Action
>;

export type PromiseThunkResult<ReturnType = void> = ThunkResult<
  Promise<ReturnType>
>;
