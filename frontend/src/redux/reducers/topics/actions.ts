import { createAsyncAction} from 'typesafe-actions';
import ActionType from './actionType';
import { Topic} from 'types';

export const fetchTopicListAction = createAsyncAction(
  ActionType.GET_TOPICS__REQUEST,
  ActionType.GET_TOPICS__SUCCESS,
  ActionType.GET_TOPICS__FAILURE,
)<undefined, Topic[], undefined>();
