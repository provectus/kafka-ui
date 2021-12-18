import fetchMock from 'fetch-mock-jest';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';
import { mockTopicsState } from 'redux/actions/__test__/fixtures';
import { MessageSchemaSourceEnum, TopicMessageSchema } from 'generated-sources';
import { FailurePayload } from 'redux/interfaces';
import { getResponse } from 'lib/errorHandling';

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
        const err = error as Response;
        expect(err.status).toEqual(404);
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
        actions.clearMessagesTopicAction.success(),
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
        const err = error as Response;
        expect(err.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.clearMessagesTopicAction.request(),
          actions.clearMessagesTopicAction.failure({}),
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
        const err = error as Response;
        expect(err.status).toEqual(404);
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
        const err = error as Response;
        expect(err.status).toEqual(200);
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
        const err = error as Response;
        expect(err.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.fetchTopicMessageSchemaAction.request(),
          actions.fetchTopicMessageSchemaAction.failure({
            alert: {
              subject: ['topic', topicName].join('-'),
              title: `Topic Schema ${topicName}`,
              response: err,
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
        const err = error as Response;
        expect(err.status).toEqual(404);
        expect(store.getActions()).toEqual([
          actions.sendTopicMessageAction.request(),
          actions.sendTopicMessageAction.failure({
            alert: {
              subject: ['topic', topicName].join('-'),
              title: `Topic Message ${topicName}`,
              response: err,
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
  describe('increasing partitions count', () => {
    it('calls updateTopicPartitionsCountAction.success on success', async () => {
      fetchMock.patchOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/partitions`,
        { totalPartitionsCount: 4, topicName }
      );
      await store.dispatch(
        thunks.updateTopicPartitionsCount(clusterName, topicName, 4)
      );
      expect(store.getActions()).toEqual([
        actions.updateTopicPartitionsCountAction.request(),
        actions.updateTopicPartitionsCountAction.success(),
      ]);
    });

    it('calls updateTopicPartitionsCountAction.failure on failure', async () => {
      fetchMock.patchOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/partitions`,
        404
      );
      try {
        await store.dispatch(
          thunks.updateTopicPartitionsCount(clusterName, topicName, 4)
        );
      } catch (error) {
        const response = await getResponse(error as Response);
        const alert: FailurePayload = {
          subject: ['topic-partitions', topicName].join('-'),
          title: `Topic ${topicName} partitions count increase failed`,
          response,
        };
        expect(store.getActions()).toEqual([
          actions.updateTopicPartitionsCountAction.request(),
          actions.updateTopicPartitionsCountAction.failure({ alert }),
        ]);
      }
    });
  });

  describe('updating replication factor', () => {
    it('calls updateTopicReplicationFactorAction.success on success', async () => {
      fetchMock.patchOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/replications`,
        { totalReplicationFactor: 4, topicName }
      );
      await store.dispatch(
        thunks.updateTopicReplicationFactor(clusterName, topicName, 4)
      );
      expect(store.getActions()).toEqual([
        actions.updateTopicReplicationFactorAction.request(),
        actions.updateTopicReplicationFactorAction.success(),
      ]);
    });

    it('calls updateTopicReplicationFactorAction.failure on failure', async () => {
      fetchMock.patchOnce(
        `/api/clusters/${clusterName}/topics/${topicName}/replications`,
        404
      );
      try {
        await store.dispatch(
          thunks.updateTopicReplicationFactor(clusterName, topicName, 4)
        );
      } catch (error) {
        const err = error as Response;
        const response = await getResponse(err);
        const alert: FailurePayload = {
          subject: ['topic-replication-factor', topicName].join('-'),
          title: `Topic ${topicName} replication factor change failed`,
          response,
        };
        expect(store.getActions()).toEqual([
          actions.updateTopicReplicationFactorAction.request(),
          actions.updateTopicReplicationFactorAction.failure({ alert }),
        ]);
      }
    });
  });
});
