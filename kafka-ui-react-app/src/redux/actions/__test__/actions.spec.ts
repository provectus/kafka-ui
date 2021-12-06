import {
  clusterSchemasPayload,
  schemaVersionsPayload,
} from 'redux/reducers/schemas/__test__/fixtures';
import * as actions from 'redux/actions';
import {
  MessageSchemaSourceEnum,
  TopicColumnsToSort,
  TopicMessageSchema,
} from 'generated-sources';
import { FailurePayload } from 'redux/interfaces';
import {
  topicMessagePayload,
  topicMessagesMetaPayload,
} from 'redux/reducers/topicMessages/__test__/fixtures';
import { fetchKsqlDbTablesPayload } from 'redux/reducers/ksqlDb/__test__/fixtures';

import { mockTopicsState } from './fixtures';

describe('Actions', () => {
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
      expect(actions.clearMessagesTopicAction.success()).toEqual({
        type: 'CLEAR_TOPIC_MESSAGES__SUCCESS',
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
        title: `Consumer Group Test`,
      };
      expect(actions.deleteConsumerGroupAction.failure({ alert })).toEqual({
        type: 'DELETE_CONSUMER_GROUP__FAILURE',
        payload: { alert },
      });
    });
  });

  describe('topic messages', () => {
    it('creates ADD_TOPIC_MESSAGE', () => {
      expect(actions.addTopicMessage(topicMessagePayload)).toEqual({
        type: 'ADD_TOPIC_MESSAGE',
        payload: topicMessagePayload,
      });
    });

    it('creates RESET_TOPIC_MESSAGES', () => {
      expect(actions.resetTopicMessages()).toEqual({
        type: 'RESET_TOPIC_MESSAGES',
      });
    });

    it('creates UPDATE_TOPIC_MESSAGES_PHASE', () => {
      expect(actions.updateTopicMessagesPhase('Polling')).toEqual({
        type: 'UPDATE_TOPIC_MESSAGES_PHASE',
        payload: 'Polling',
      });
    });

    it('creates UPDATE_TOPIC_MESSAGES_META', () => {
      expect(actions.updateTopicMessagesMeta(topicMessagesMetaPayload)).toEqual(
        {
          type: 'UPDATE_TOPIC_MESSAGES_META',
          payload: topicMessagesMetaPayload,
        }
      );
    });
  });

  describe('sending messages', () => {
    describe('fetchTopicMessageSchemaAction', () => {
      it('creates GET_TOPIC_SCHEMA__REQUEST', () => {
        expect(actions.fetchTopicMessageSchemaAction.request()).toEqual({
          type: 'GET_TOPIC_SCHEMA__REQUEST',
        });
      });
      it('creates GET_TOPIC_SCHEMA__SUCCESS', () => {
        const messageSchema: TopicMessageSchema = {
          key: {
            name: 'key',
            source: MessageSchemaSourceEnum.SCHEMA_REGISTRY,
            schema: `{
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "http://example.com/myURI.schema.json",
        "title": "TestRecord",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "f1": {
            "type": "integer"
          },
          "f2": {
            "type": "string"
          },
          "schema": {
            "type": "string"
          }
        }
        }
        `,
          },
          value: {
            name: 'value',
            source: MessageSchemaSourceEnum.SCHEMA_REGISTRY,
            schema: `{
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$id": "http://example.com/myURI1.schema.json",
        "title": "TestRecord",
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "f1": {
            "type": "integer"
          },
          "f2": {
            "type": "string"
          },
          "schema": {
            "type": "string"
          }
        }
        }
        `,
          },
        };
        expect(
          actions.fetchTopicMessageSchemaAction.success({
            topicName: 'test',
            schema: messageSchema,
          })
        ).toEqual({
          type: 'GET_TOPIC_SCHEMA__SUCCESS',
          payload: {
            topicName: 'test',
            schema: messageSchema,
          },
        });
      });

      it('creates GET_TOPIC_SCHEMA__FAILURE', () => {
        const alert: FailurePayload = {
          subject: ['message-chema', 'test'].join('-'),
          title: `Message Schema Test`,
        };
        expect(
          actions.fetchTopicMessageSchemaAction.failure({ alert })
        ).toEqual({
          type: 'GET_TOPIC_SCHEMA__FAILURE',
          payload: { alert },
        });
      });
    });
  });
});

describe('ksqlDb', () => {
  it('creates GET_KSQL_DB_TABLES_AND_STREAMS__REQUEST', () => {
    expect(actions.fetchKsqlDbTablesAction.request()).toEqual({
      type: 'GET_KSQL_DB_TABLES_AND_STREAMS__REQUEST',
    });
  });
  it('creates GET_KSQL_DB_TABLES_AND_STREAMS__SUCCESS', () => {
    expect(
      actions.fetchKsqlDbTablesAction.success(fetchKsqlDbTablesPayload)
    ).toEqual({
      type: 'GET_KSQL_DB_TABLES_AND_STREAMS__SUCCESS',
      payload: fetchKsqlDbTablesPayload,
    });
  });
  it('creates GET_KSQL_DB_TABLES_AND_STREAMS__FAILURE', () => {
    expect(actions.fetchKsqlDbTablesAction.failure({})).toEqual({
      type: 'GET_KSQL_DB_TABLES_AND_STREAMS__FAILURE',
      payload: {},
    });
  });
});
