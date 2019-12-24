import { ActionType } from 'typesafe-actions';
import * as topicsActions from 'redux/reducers/topics/actions';
import { ThunkAction } from 'redux-thunk';
import { TopicsState } from './topic';
import { AnyAction } from 'redux';
export * from './topic';

export enum FetchStatus {
  notFetched = 'notFetched',
  fetching = 'fetching',
  fetched = 'fetched',
  errorFetching = 'errorFetching',
}

export interface RootState {
  topics: TopicsState;
}

export type Action = ActionType<typeof topicsActions>;

export type PromiseThunk<T> = ThunkAction<Promise<T>, RootState, undefined, AnyAction>;
