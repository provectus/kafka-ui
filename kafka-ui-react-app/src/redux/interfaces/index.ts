import { ActionType } from 'typesafe-actions';
import { ThunkAction } from 'redux-thunk';

import * as actions from 'redux/actions/actions';

import { TopicsState } from './topic';
import { ClusterState } from './cluster';
import { BrokersState } from './broker';
import { LoaderState } from './loader';
import { ConsumerGroupsState } from './consumerGroup';
import { SchemasState } from './schema';

export * from './topic';
export * from './cluster';
export * from './broker';
export * from './consumerGroup';
export * from './schema';
export * from './loader';

export interface RootState {
  topics: TopicsState;
  clusters: ClusterState;
  brokers: BrokersState;
  consumerGroups: ConsumerGroupsState;
  schemas: SchemasState;
  loader: LoaderState;
}

export type Action = ActionType<typeof actions>;

export type PromiseThunk<T> = ThunkAction<
  Promise<T>,
  RootState,
  undefined,
  Action
>;
