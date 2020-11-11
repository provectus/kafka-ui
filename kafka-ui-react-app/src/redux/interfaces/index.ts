import { AnyAction } from 'redux';
import { ActionType } from 'typesafe-actions';
import { ThunkAction } from 'redux-thunk';

import * as actions from 'redux/actions/actions';

import { TopicsState } from './topic';
import { Cluster } from './cluster';
import { BrokersState } from './broker';
import { LoaderState } from './loader';
import { ConsumerGroupsState } from './consumerGroup';

export * from './topic';
export * from './cluster';
export * from './broker';
export * from './consumerGroup';
export * from './loader';

export enum FetchStatus {
  notFetched = 'notFetched',
  fetching = 'fetching',
  fetched = 'fetched',
  errorFetching = 'errorFetching',
}

export interface RootState {
  topics: TopicsState;
  clusters: Cluster[];
  brokers: BrokersState;
  consumerGroups: ConsumerGroupsState;
  loader: LoaderState;
}

export type Action = ActionType<typeof actions>;

export type PromiseThunk<T> = ThunkAction<
  Promise<T>,
  RootState,
  undefined,
  AnyAction
>;
