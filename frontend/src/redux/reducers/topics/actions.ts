import { createAsyncAction} from 'typesafe-actions';
import ActionType from './actionType';
import { Topic, TopicDetails, TopicName} from 'types';

export const fetchTopicListAction = createAsyncAction(
  ActionType.GET_TOPICS__REQUEST,
  ActionType.GET_TOPICS__SUCCESS,
  ActionType.GET_TOPICS__FAILURE,
)<undefined, Topic[], undefined>();

export const fetchTopicDetailsAction = createAsyncAction(
  ActionType.GET_TOPIC_DETAILS__REQUEST,
  ActionType.GET_TOPIC_DETAILS__SUCCESS,
  ActionType.GET_TOPIC_DETAILS__FAILURE,
)<undefined, { topicName: TopicName, details: TopicDetails }, undefined>();
