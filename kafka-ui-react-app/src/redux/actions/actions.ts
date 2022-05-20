import { createAction, createAsyncAction } from 'typesafe-actions';
import { TopicName } from 'redux/interfaces';

// export const createTopicAction = createAsyncAction(
//   'POST_TOPIC__REQUEST',
//   'POST_TOPIC__SUCCESS',
//   'POST_TOPIC__FAILURE'
// )<undefined, TopicsState, { alert?: FailurePayload }>();

export const deleteTopicAction = createAsyncAction(
  'DELETE_TOPIC__REQUEST',
  'DELETE_TOPIC__SUCCESS',
  'DELETE_TOPIC__FAILURE',
  'DELETE_TOPIC__CANCEL'
)<undefined, TopicName, undefined, undefined>();

export const dismissAlert = createAction('DISMISS_ALERT')<string>();
