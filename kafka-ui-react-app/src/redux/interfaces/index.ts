import { ActionType } from 'typesafe-actions';
import { ThunkAction } from 'redux-thunk';
import * as actions from 'redux/actions/actions';

import { TopicsState } from './topic';
import { ClusterState } from './cluster';
import { BrokersState } from './broker';
import { LoaderState } from './loader';
import { ConsumerGroupsState } from './consumerGroup';
import { SchemasState } from './schema';
import { AlertsState } from './alerts';
import { ConnectState } from './connect';

export * from './topic';
export * from './cluster';
export * from './broker';
export * from './consumerGroup';
export * from './schema';
export * from './loader';
export * from './alerts';
export * from './connect';

export interface RootState {
  topics: TopicsState;
  clusters: ClusterState;
  brokers: BrokersState;
  consumerGroups: ConsumerGroupsState;
  schemas: SchemasState;
  connect: ConnectState;
  loader: LoaderState;
  alerts: AlertsState;
}

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
