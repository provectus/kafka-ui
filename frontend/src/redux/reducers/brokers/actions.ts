import { createAsyncAction} from 'typesafe-actions';
import ActionType from './actionType';
import { Broker } from 'types';

export const fetchBrokersAction = createAsyncAction(
  ActionType.GET_BROKERS__REQUEST,
  ActionType.GET_BROKERS__SUCCESS,
  ActionType.GET_BROKERS__FAILURE,
)<undefined, Broker[], undefined>();
