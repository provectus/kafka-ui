import { ActionType } from 'typesafe-actions';
import * as topicsActions from 'redux/reducers/topics/actions';
import * as clustersActions from 'redux/reducers/clusters/actions';
import { ThunkAction } from 'redux-thunk';
import { TopicsState } from './topic';
import { AnyAction } from 'redux';
import { ClustersState } from './cluster';

export * from './topic';
export * from './cluster';

export enum FetchStatus {
  notFetched = 'notFetched',
  fetching = 'fetching',
  fetched = 'fetched',
  errorFetching = 'errorFetching',
}

export interface RootState {
  topics: TopicsState;
  clusters: ClustersState;
}

export type Action = ActionType<typeof topicsActions | typeof clustersActions>;

export type PromiseThunk<T> = ThunkAction<Promise<T>, RootState, undefined, AnyAction>;
