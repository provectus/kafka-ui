import { createAsyncAction} from 'typesafe-actions';
import ActionType from './actionType';
import { Broker, BrokerMetrics } from 'lib/interfaces';

export const fetchBrokersAction = createAsyncAction(
  ActionType.GET_BROKERS__REQUEST,
  ActionType.GET_BROKERS__SUCCESS,
  ActionType.GET_BROKERS__FAILURE,
)<undefined, Broker[], undefined>();

export const fetchBrokerMetricsAction = createAsyncAction(
  ActionType.GET_BROKER_METRICS__REQUEST,
  ActionType.GET_BROKER_METRICS__SUCCESS,
  ActionType.GET_BROKER_METRICS__FAILURE,
)<undefined, BrokerMetrics, undefined>();
