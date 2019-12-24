import { createAsyncAction} from 'typesafe-actions';
import ActionType from './actionType';
import { Topic, Broker } from 'types';

export const fetchTopicListAction = createAsyncAction(
  ActionType.TOPICS__FETCH_REQUEST,
  ActionType.TOPICS__FETCH_SUCCESS,
  ActionType.TOPICS__FETCH_FAILURE,
)<undefined, Topic[], undefined>();

export const fetchBrokersAction = createAsyncAction(
  ActionType.BROKERS__FETCH_REQUEST,
  ActionType.BROKERS__FETCH_SUCCESS,
  ActionType.BROKERS__FETCH_FAILURE,
)<undefined, Broker[], undefined>();
