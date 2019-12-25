import { createAsyncAction} from 'typesafe-actions';
import ActionType from './actionType';
import { Cluster } from 'types';

export const fetchClusterListAction = createAsyncAction(
  ActionType.CLUSTERS__FETCH_REQUEST,
  ActionType.CLUSTERS__FETCH_SUCCESS,
  ActionType.CLUSTERS__FETCH_FAILURE,
)<undefined, Cluster[], undefined>();
