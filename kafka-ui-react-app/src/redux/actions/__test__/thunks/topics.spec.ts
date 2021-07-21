import fetchMock from 'fetch-mock-jest';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';
import { mockTopicsState } from 'redux/actions/__test__/fixtures';
import { MessageSchemaSourceEnum, TopicMessageSchema } from 'generated-sources';

const store = mockStoreCreator;

const clusterName = 'local';
const topicName = 'localTopic';

describe('Thunks', () => {
  afterEach(() => {
    fetchMock.restore();
    store.clearActions();
  });

  describe('deleteTopis', () => {
    it('creates DELETE_TOPIC__SUCCESS when deleting existing topic', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/topics/${topicName}`,
        200
      );
      await store.dispatch(thunks.deleteTopic(clusterName, topicName));
      expect(store.getActions()).toEqual([
        actions.deleteTopicAction.request(),
        actions.deleteTopicAction.success(topicName),
      ]);
    });

    it('creates DELETE_TOPIC__FAILURE when deleting existing topic', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/topics/${topicName}`,
        404
      );
      try {
        await store.dispatch(thunks.deleteTopic(clusterName, topicName));
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.deleteTopicAction.request(),
          actions.deleteTopicAction.failure(),
        ]);
      }
    });
  });

  describe('clearTopicMessages', () => {
    it('creates CLEAR_TOPIC_MESSAGES__SUCCESS when deleting existing messages', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages`,
        200
      );
      await store.dispatch(thunks.clearTopicMessages(clusterName, topicName));
      expect(store.getActions()).toEqual([
        actions.clearMessagesTopicAction.request(),
        actions.clearMessagesTopicAction.success(topicName),
      ]);
    });

    it('creates CLEAR_TOPIC_MESSAGES__FAILURE when deleting existing messages', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages`,
        404
      );
      try {
        await store.dispatch(thunks.clearTopicMessages(clusterName, topicName));
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.clearMessagesTopicAction.request(),
          actions.clearMessagesTopicAction.failure({}),
        ]);
      }
    });
  });

  describe('fetchTopicMessages', () => {
    it('creates GET_TOPIC_MESSAGES__FAILURE when deleting existing messages', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages`,
        404
      );
      try {
        await store.dispatch(
          thunks.fetchTopicMessages(clusterName, topicName, {})
        );
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.fetchTopicMessagesAction.request(),
          actions.fetchTopicMessagesAction.failure(),
        ]);
      }
    });
  });

  describe('fetchTopicConsumerGroups', () => {
    it('GET_TOPIC_CONSUMER_GROUPS__FAILURE', async () => {
      fetchMock.getOnce(
        `api/clusters/${clusterName}/topics/${topicName}/consumer-groups`,
        404
      );
      try {
        await store.dispatch(
          thunks.fetchTopicConsumerGroups(clusterName, topicName)
        );
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.fetchTopicConsumerGroupsAction.request(),
          actions.fetchTopicConsumerGroupsAction.failure(),
        ]);
      }
    });

    it('GET_TOPIC_CONSUMER_GROUPS__SUCCESS', async () => {
      fetchMock.getOnce(
        `api/clusters/${clusterName}/topics/${topicName}/consumer-groups`,
        200
      );
      try {
        await store.dispatch(
          thunks.fetchTopicConsumerGroups(clusterName, topicName)
        );
      } catch (error) {
        expect(error.status).toEqual(200);
        expect(store.getActions()).toEqual([
          actions.fetchTopicConsumerGroupsAction.request(),
          actions.fetchTopicConsumerGroupsAction.success(mockTopicsState),
        ]);
      }
    });
  });

  describe('fetchTopicMessageSchema', () => {
    it('creates GET_TOPIC_SCHEMA__FAILURE', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages/schema`,
        404
      );
      try {
        await store.dispatch(
          thunks.fetchTopicMessageSchema(clusterName, topicName)
        );
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.fetchTopicMessageSchemaAction.request(),
          actions.fetchTopicMessageSchemaAction.failure({
            alert: {
              subject: ['topic', topicName].join('-'),
              title: `Topic Schema ${topicName}`,
              response: error,
            },
          }),
        ]);
      }
    });

    it('creates GET_TOPIC_SCHEMA__SUCCESS', async () => {
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
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages/schema`,
        messageSchema
      );
      await store.dispatch(
        thunks.fetchTopicMessageSchema(clusterName, topicName)
      );
      expect(store.getActions()).toEqual([
        actions.fetchTopicMessageSchemaAction.request(),
        actions.fetchTopicMessageSchemaAction.success({
          topicName,
          schema: messageSchema,
        }),
      ]);
    });
  });

  describe('sendTopicMessage', () => {
    it('creates SEND_TOPIC_MESSAGE__FAILURE', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages`,
        404
      );
      try {
        await store.dispatch(
          thunks.sendTopicMessage(clusterName, topicName, {
            key: '{}',
            content: '{}',
            headers: undefined,
            partition: 0,
          })
        );
      } catch (error) {
        expect(error.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.sendTopicMessageAction.request(),
          actions.sendTopicMessageAction.failure({
            alert: {
              subject: ['topic', topicName].join('-'),
              title: `Topic Message ${topicName}`,
              response: error,
            },
          }),
        ]);
      }
    });

    it('creates SEND_TOPIC_MESSAGE__SUCCESS', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/messages`,
        200
      );
      await store.dispatch(
        thunks.sendTopicMessage(clusterName, topicName, {
          key: '{}',
          content: '{}',
          headers: undefined,
          partition: 0,
        })
      );
      expect(store.getActions()).toEqual([
        actions.sendTopicMessageAction.request(),
        actions.sendTopicMessageAction.success(),
      ]);
    });
  });
});
