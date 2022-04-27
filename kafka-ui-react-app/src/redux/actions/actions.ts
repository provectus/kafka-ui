import { createAction, createAsyncAction } from 'typesafe-actions';
import { FailurePayload, TopicName, TopicsState } from 'redux/interfaces';
import {
  TopicColumnsToSort,
  Topic,
  TopicMessageSchema,
} from 'generated-sources';

export const fetchTopicsListAction = createAsyncAction(
  'GET_TOPICS__REQUEST',
  'GET_TOPICS__SUCCESS',
  'GET_TOPICS__FAILURE'
)<undefined, TopicsState, undefined>();

export const clearMessagesTopicAction = createAsyncAction(
  'CLEAR_TOPIC_MESSAGES__REQUEST',
  'CLEAR_TOPIC_MESSAGES__SUCCESS',
  'CLEAR_TOPIC_MESSAGES__FAILURE'
)<undefined, undefined, { alert?: FailurePayload }>();

export const fetchTopicDetailsAction = createAsyncAction(
  'GET_TOPIC_DETAILS__REQUEST',
  'GET_TOPIC_DETAILS__SUCCESS',
  'GET_TOPIC_DETAILS__FAILURE'
)<undefined, TopicsState, undefined>();

export const fetchTopicConfigAction = createAsyncAction(
  'GET_TOPIC_CONFIG__REQUEST',
  'GET_TOPIC_CONFIG__SUCCESS',
  'GET_TOPIC_CONFIG__FAILURE'
)<undefined, TopicsState, undefined>();

export const createTopicAction = createAsyncAction(
  'POST_TOPIC__REQUEST',
  'POST_TOPIC__SUCCESS',
  'POST_TOPIC__FAILURE'
)<undefined, TopicsState, { alert?: FailurePayload }>();

export const updateTopicAction = createAsyncAction(
  'PATCH_TOPIC__REQUEST',
  'PATCH_TOPIC__SUCCESS',
  'PATCH_TOPIC__FAILURE'
)<undefined, TopicsState, undefined>();

export const deleteTopicAction = createAsyncAction(
  'DELETE_TOPIC__REQUEST',
  'DELETE_TOPIC__SUCCESS',
  'DELETE_TOPIC__FAILURE',
  'DELETE_TOPIC__CANCEL'
)<undefined, TopicName, undefined, undefined>();

export const recreateTopicAction = createAsyncAction(
  'RECREATE_TOPIC__REQUEST',
  'RECREATE_TOPIC__SUCCESS',
  'RECREATE_TOPIC__FAILURE',
  'RECREATE_TOPIC__CANCEL'
)<undefined, Topic, undefined, undefined>();

export const dismissAlert = createAction('DISMISS_ALERT')<string>();

export const setTopicsSearchAction =
  createAction('SET_TOPICS_SEARCH')<string>();

export const setTopicsOrderByAction = createAction(
  'SET_TOPICS_ORDER_BY'
)<TopicColumnsToSort>();

export const fetchTopicConsumerGroupsAction = createAsyncAction(
  'GET_TOPIC_CONSUMER_GROUPS__REQUEST',
  'GET_TOPIC_CONSUMER_GROUPS__SUCCESS',
  'GET_TOPIC_CONSUMER_GROUPS__FAILURE'
)<undefined, TopicsState, undefined>();

export const fetchTopicMessageSchemaAction = createAsyncAction(
  'GET_TOPIC_SCHEMA__REQUEST',
  'GET_TOPIC_SCHEMA__SUCCESS',
  'GET_TOPIC_SCHEMA__FAILURE'
)<
  undefined,
  { topicName: string; schema: TopicMessageSchema },
  { alert?: FailurePayload }
>();

export const updateTopicPartitionsCountAction = createAsyncAction(
  'UPDATE_PARTITIONS__REQUEST',
  'UPDATE_PARTITIONS__SUCCESS',
  'UPDATE_PARTITIONS__FAILURE'
)<undefined, undefined, { alert?: FailurePayload }>();

export const updateTopicReplicationFactorAction = createAsyncAction(
  'UPDATE_REPLICATION_FACTOR__REQUEST',
  'UPDATE_REPLICATION_FACTOR__SUCCESS',
  'UPDATE_REPLICATION_FACTOR__FAILURE'
)<undefined, undefined, { alert?: FailurePayload }>();
