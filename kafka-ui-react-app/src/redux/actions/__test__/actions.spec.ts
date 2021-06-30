import {
  clusterSchemasPayload,
  schemaVersionsPayload,
} from 'redux/reducers/schemas/__test__/fixtures';
import * as actions from 'redux/actions';
import { TopicColumnsToSort } from 'generated-sources';
import { FailurePayload } from 'redux/interfaces';

import { mockTopicsState } from './fixtures';

describe('Actions', () => {
  describe('fetchClusterStatsAction', () => {
    it('creates a REQUEST action', () => {
      expect(actions.fetchClusterStatsAction.request()).toEqual({
        type: 'GET_CLUSTER_STATUS__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(
        actions.fetchClusterStatsAction.success({ brokerCount: 1 })
      ).toEqual({
        type: 'GET_CLUSTER_STATUS__SUCCESS',
        payload: {
          brokerCount: 1,
        },
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.fetchClusterStatsAction.failure()).toEqual({
        type: 'GET_CLUSTER_STATUS__FAILURE',
      });
    });
  });

  describe('fetchSchemasByClusterNameAction', () => {
    it('creates a REQUEST action', () => {
      expect(actions.fetchSchemasByClusterNameAction.request()).toEqual({
        type: 'GET_CLUSTER_SCHEMAS__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(
        actions.fetchSchemasByClusterNameAction.success(clusterSchemasPayload)
      ).toEqual({
        type: 'GET_CLUSTER_SCHEMAS__SUCCESS',
        payload: clusterSchemasPayload,
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.fetchSchemasByClusterNameAction.failure()).toEqual({
        type: 'GET_CLUSTER_SCHEMAS__FAILURE',
      });
    });
  });

  describe('fetchSchemaVersionsAction', () => {
    it('creates a REQUEST action', () => {
      expect(actions.fetchSchemaVersionsAction.request()).toEqual({
        type: 'GET_SCHEMA_VERSIONS__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(
        actions.fetchSchemaVersionsAction.success(schemaVersionsPayload)
      ).toEqual({
        type: 'GET_SCHEMA_VERSIONS__SUCCESS',
        payload: schemaVersionsPayload,
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.fetchSchemaVersionsAction.failure()).toEqual({
        type: 'GET_SCHEMA_VERSIONS__FAILURE',
      });
    });
  });

  describe('createSchemaAction', () => {
    it('creates a REQUEST action', () => {
      expect(actions.createSchemaAction.request()).toEqual({
        type: 'POST_SCHEMA__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(
        actions.createSchemaAction.success(schemaVersionsPayload[0])
      ).toEqual({
        type: 'POST_SCHEMA__SUCCESS',
        payload: schemaVersionsPayload[0],
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.createSchemaAction.failure({})).toEqual({
        type: 'POST_SCHEMA__FAILURE',
        payload: {},
      });
    });
  });

  describe('dismissAlert', () => {
    it('creates a REQUEST action', () => {
      const id = 'alert-id1';
      expect(actions.dismissAlert(id)).toEqual({
        type: 'DISMISS_ALERT',
        payload: id,
      });
    });
  });

  describe('clearMessagesTopicAction', () => {
    it('creates a REQUEST action', () => {
      expect(actions.clearMessagesTopicAction.request()).toEqual({
        type: 'CLEAR_TOPIC_MESSAGES__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(actions.clearMessagesTopicAction.success('topic')).toEqual({
        type: 'CLEAR_TOPIC_MESSAGES__SUCCESS',
        payload: 'topic',
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.clearMessagesTopicAction.failure({})).toEqual({
        type: 'CLEAR_TOPIC_MESSAGES__FAILURE',
        payload: {},
      });
    });
  });

  describe('fetchTopicConsumerGroups', () => {
    it('creates a REQUEST action', () => {
      expect(actions.fetchTopicConsumerGroupsAction.request()).toEqual({
        type: 'GET_TOPIC_CONSUMER_GROUPS__REQUEST',
      });
    });

    it('creates a SUCCESS action', () => {
      expect(
        actions.fetchTopicConsumerGroupsAction.success(mockTopicsState)
      ).toEqual({
        type: 'GET_TOPIC_CONSUMER_GROUPS__SUCCESS',
        payload: mockTopicsState,
      });
    });

    it('creates a FAILURE action', () => {
      expect(actions.fetchTopicConsumerGroupsAction.failure()).toEqual({
        type: 'GET_TOPIC_CONSUMER_GROUPS__FAILURE',
      });
    });
  });

  describe('setTopicsSearchAction', () => {
    it('creartes SET_TOPICS_SEARCH', () => {
      expect(actions.setTopicsSearchAction('test')).toEqual({
        type: 'SET_TOPICS_SEARCH',
        payload: 'test',
      });
    });
  });

  describe('setTopicsOrderByAction', () => {
    it('creartes SET_TOPICS_ORDER_BY', () => {
      expect(actions.setTopicsOrderByAction(TopicColumnsToSort.NAME)).toEqual({
        type: 'SET_TOPICS_ORDER_BY',
        payload: TopicColumnsToSort.NAME,
      });
    });
  });

  describe('deleting consumer group', () => {
    it('creates DELETE_CONSUMER_GROUP__REQUEST', () => {
      expect(actions.deleteConsumerGroupAction.request()).toEqual({
        type: 'DELETE_CONSUMER_GROUP__REQUEST',
      });
    });

    it('creates DELETE_CONSUMER_GROUP__SUCCESS', () => {
      expect(actions.deleteConsumerGroupAction.success('test')).toEqual({
        type: 'DELETE_CONSUMER_GROUP__SUCCESS',
        payload: 'test',
      });
    });

    it('creates DELETE_CONSUMER_GROUP__FAILURE', () => {
      const alert: FailurePayload = {
        subject: ['consumer-group', 'test'].join('-'),
        title: `Consumer Gropup Test`,
      };
      expect(actions.deleteConsumerGroupAction.failure({ alert })).toEqual({
        type: 'DELETE_CONSUMER_GROUP__FAILURE',
        payload: { alert },
      });
    });
  });
});
