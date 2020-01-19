import { createAsyncAction} from 'typesafe-actions';
import ActionType from './actionType';
import { Cluster } from 'lib/interfaces';

export const fetchClusterListAction = createAsyncAction(
  ActionType.GET_CLUSTERS__REQUEST,
  ActionType.GET_CLUSTERS__SUCCESS,
  ActionType.GET_CLUSTERS__FAILURE,
)<undefined, Cluster[], undefined>();
