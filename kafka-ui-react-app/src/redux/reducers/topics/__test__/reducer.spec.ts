import {
  MessageSchemaSourceEnum,
  SortOrder,
  TopicColumnsToSort,
  ConfigSource,
} from 'generated-sources';
import reducer, {
  clearTopicsMessages,
  setTopicsSearch,
  setTopicsOrderBy,
  fetchTopicConsumerGroups,
  fetchTopicMessageSchema,
  recreateTopic,
  createTopic,
  deleteTopic,
  fetchTopicsList,
  fetchTopicDetails,
  fetchTopicConfig,
  updateTopic,
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
  deleteTopics,
} from 'redux/reducers/topics/topicsSlice';
import {
  createTopicPayload,
  createTopicResponsePayload,
} from 'components/Topics/New/__test__/fixtures';
import { consumerGroupPayload } from 'redux/reducers/consumerGroups/__test__/fixtures';
import fetchMock from 'fetch-mock-jest';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';
import { getTypeAndPayload } from 'lib/testHelpers';
import {
  alertAdded,
  showSuccessAlert,
} from 'redux/reducers/alerts/alertsSlice';

const topic = {
  name: 'topic',
  id: 'id',
};

const messageSchema = {
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

const config = [
  {
    name: 'compression.type',
    value: 'producer',
    defaultValue: 'producer',
    source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
    isSensitive: false,
    isReadOnly: false,
    synonyms: [
      {
        name: 'compression.type',
        value: 'producer',
        source: ConfigSource.DYNAMIC_TOPIC_CONFIG,
      },
      {
        name: 'compression.type',
        value: 'producer',
        source: ConfigSource.DEFAULT_CONFIG,
      },
    ],
  },
];
const details = {
  name: 'local',
  internal: false,
  partitionCount: 1,
  replicationFactor: 1,
  replicas: 1,
  inSyncReplicas: 1,
  segmentSize: 0,
  segmentCount: 0,
  cleanUpPolicy: 'DELETE',
  partitions: [
    {
      partition: 0,
      leader: 1,
      replicas: [{ broker: 1, leader: false, inSync: true }],
      offsetMax: 0,
      offsetMin: 0,
    },
  ],
  bytesInPerSec: 0.1,
  bytesOutPerSec: 0.1,
};

let state = {
  byName: {
    [topic.name]: topic,
  },
  allNames: [topic.name],
  messages: [],
  totalPages: 1,
  search: '',
  orderBy: null,
  sortOrder: SortOrder.ASC,
  consumerGroups: [],
};
const clusterName = 'local';

describe('topics Slice', () => {
  describe('topics reducer', () => {
    describe('fetch topic details', () => {
      it('fetchTopicDetails/fulfilled', () => {
        expect(
          reducer(state, {
            type: fetchTopicDetails.fulfilled,
            payload: {
              clusterName,
              topicName: topic.name,
              topicDetails: details,
            },
          })
        ).toEqual({
          ...state,
          byName: {
            [topic.name]: {
              ...topic,
              ...details,
            },
          },
          allNames: [topic.name],
        });
      });
    });
    describe('fetch topics', () => {
      it('fetchTopicsList/fulfilled', () => {
        expect(
          reducer(state, {
            type: fetchTopicsList.fulfilled,
            payload: { clusterName, topicName: topic.name },
          })
        ).toEqual({
          ...state,
          byName: { topic },
          allNames: [topic.name],
        });
      });
    });
    describe('fetch topic config', () => {
      it('fetchTopicConfig/fulfilled', () => {
        expect(
          reducer(state, {
            type: fetchTopicConfig.fulfilled,
            payload: {
              clusterName,
              topicName: topic.name,
              topicConfig: config,
            },
          })
        ).toEqual({
          ...state,
          byName: {
            [topic.name]: {
              ...topic,
              config: config.map((conf) => ({ ...conf })),
            },
          },
          allNames: [topic.name],
        });
      });
    });
    describe('update topic', () => {
      it('updateTopic/fulfilled', () => {
        const updatedTopic = {
          name: 'topic',
          id: 'id',
          partitions: 1,
        };
        expect(
          reducer(state, {
            type: updateTopic.fulfilled,
            payload: {
              clusterName,
              topicName: topic.name,
              topic: updatedTopic,
            },
          })
        ).toEqual({
          ...state,
          byName: {
            [topic.name]: {
              ...updatedTopic,
            },
          },
        });
      });
    });
    describe('delete topic', () => {
      it('deleteTopic/fulfilled', () => {
        expect(
          reducer(state, {
            type: deleteTopic.fulfilled,
            payload: { clusterName, topicName: topic.name },
          })
        ).toEqual({
          ...state,
          byName: {},
          allNames: [],
        });
      });

      it('clearTopicsMessages/fulfilled', () => {
        expect(
          reducer(state, {
            type: clearTopicsMessages.fulfilled,
            payload: { clusterName, topicName: topic.name },
          })
        ).toEqual({
          ...state,
          messages: [],
        });
      });

      it('recreateTopic/fulfilled', () => {
        expect(
          reducer(state, {
            type: recreateTopic.fulfilled,
            payload: { topic, topicName: topic.name },
          })
        ).toEqual({
          ...state,
          byName: {
            [topic.name]: topic,
          },
        });
      });
    });

    describe('create topics', () => {
      it('createTopic/fulfilled', () => {
        expect(
          reducer(state, {
            type: createTopic.fulfilled,
            payload: { clusterName, data: createTopicPayload },
          })
        ).toEqual({
          ...state,
        });
      });
    });

    describe('search topics', () => {
      it('setTopicsSearch', () => {
        expect(
          reducer(state, {
            type: setTopicsSearch,
            payload: 'test',
          })
        ).toEqual({
          ...state,
          search: 'test',
        });
      });
    });

    describe('order topics', () => {
      it('setTopicsOrderBy', () => {
        expect(
          reducer(state, {
            type: setTopicsOrderBy,
            payload: TopicColumnsToSort.NAME,
          })
        ).toEqual({
          ...state,
          orderBy: TopicColumnsToSort.NAME,
        });
      });
    });

    describe('topic consumer groups', () => {
      it('fetchTopicConsumerGroups/fulfilled', () => {
        expect(
          reducer(state, {
            type: fetchTopicConsumerGroups.fulfilled,
            payload: {
              clusterName,
              topicName: topic.name,
              consumerGroups: consumerGroupPayload,
            },
          })
        ).toEqual({
          ...state,
          byName: {
            [topic.name]: {
              ...topic,
              ...consumerGroupPayload,
            },
          },
        });
      });
    });

    describe('message sending', () => {
      it('fetchTopicMessageSchema/fulfilled', () => {
        state = {
          byName: {
            [topic.name]: topic,
          },
          allNames: [topic.name],
          messages: [],
          totalPages: 1,
          search: '',
          orderBy: null,
          sortOrder: SortOrder.ASC,
          consumerGroups: [],
        };
        expect(
          reducer(state, {
            type: fetchTopicMessageSchema.fulfilled,
            payload: { topicName: topic.name, schema: messageSchema },
          }).byName
        ).toEqual({
          [topic.name]: { ...topic, messageSchema },
        });
      });
    });
  });
  describe('Thunks', () => {
    const store = mockStoreCreator;
    const topicName = topic.name;
    const RealDate = Date.now;

    beforeAll(() => {
      global.Date.now = jest.fn(() =>
        new Date('2019-04-07T10:20:30Z').getTime()
      );
    });
    afterAll(() => {
      global.Date.now = RealDate;
    });
    afterEach(() => {
      fetchMock.restore();
      store.clearActions();
    });
    describe('fetchTopicsList', () => {
      const topicResponse = {
        pageCount: 1,
        topics: [createTopicResponsePayload],
      };
      it('fetchTopicsList/fulfilled', async () => {
        fetchMock.getOnce(`/api/clusters/${clusterName}/topics`, topicResponse);
        await store.dispatch(fetchTopicsList({ clusterName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: fetchTopicsList.pending.type },
          {
            type: fetchTopicsList.fulfilled.type,
            payload: { ...topicResponse },
          },
        ]);
      });
      it('fetchTopicsList/rejected', async () => {
        fetchMock.getOnce(`/api/clusters/${clusterName}/topics`, 404);
        await store.dispatch(fetchTopicsList({ clusterName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: fetchTopicsList.pending.type },
          {
            type: fetchTopicsList.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('fetchTopicDetails', () => {
      it('fetchTopicDetails/fulfilled', async () => {
        fetchMock.getOnce(
          `/api/clusters/${clusterName}/topics/${topicName}`,
          details
        );
        await store.dispatch(fetchTopicDetails({ clusterName, topicName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: fetchTopicDetails.pending.type },
          {
            type: fetchTopicDetails.fulfilled.type,
            payload: { topicDetails: { ...details }, topicName },
          },
        ]);
      });
      it('fetchTopicDetails/rejected', async () => {
        fetchMock.getOnce(
          `/api/clusters/${clusterName}/topics/${topicName}`,
          404
        );
        await store.dispatch(fetchTopicDetails({ clusterName, topicName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: fetchTopicDetails.pending.type },
          {
            type: fetchTopicDetails.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics/${topicName}`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('fetchTopicConfig', () => {
      it('fetchTopicConfig/fulfilled', async () => {
        fetchMock.getOnce(
          `/api/clusters/${clusterName}/topics/${topicName}/config`,
          config
        );
        await store.dispatch(fetchTopicConfig({ clusterName, topicName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: fetchTopicConfig.pending.type },
          {
            type: fetchTopicConfig.fulfilled.type,
            payload: {
              topicConfig: config,
              topicName,
            },
          },
        ]);
      });
      it('fetchTopicConfig/rejected', async () => {
        fetchMock.getOnce(
          `/api/clusters/${clusterName}/topics/${topicName}/config`,
          404
        );
        await store.dispatch(fetchTopicConfig({ clusterName, topicName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: fetchTopicConfig.pending.type },
          {
            type: fetchTopicConfig.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics/${topicName}/config`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('deleteTopic', () => {
      it('deleteTopic/fulfilled', async () => {
        fetchMock.deleteOnce(
          `/api/clusters/${clusterName}/topics/${topicName}`,
          topicName
        );
        await store.dispatch(deleteTopic({ clusterName, topicName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: deleteTopic.pending.type },
          { type: showSuccessAlert.pending.type },
          {
            type: alertAdded.type,
            payload: {
              id: 'message-topic-local',
              title: '',
              type: 'success',
              createdAt: global.Date.now(),
              message: 'Topic successfully deleted!',
            },
          },
          { type: showSuccessAlert.fulfilled.type },
          {
            type: deleteTopic.fulfilled.type,
            payload: { topicName },
          },
        ]);
      });
      it('deleteTopic/rejected', async () => {
        fetchMock.deleteOnce(
          `/api/clusters/${clusterName}/topics/${topicName}`,
          404
        );
        await store.dispatch(deleteTopic({ clusterName, topicName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: deleteTopic.pending.type },
          {
            type: deleteTopic.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics/${topicName}`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('deleteTopics', () => {
      it('deleteTopics/fulfilled', async () => {
        fetchMock.delete(`/api/clusters/${clusterName}/topics/${topicName}`, [
          topicName,
          'topic2',
        ]);
        await store.dispatch(
          deleteTopics({ clusterName, topicNames: [topicName, 'topic2'] })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: deleteTopics.pending.type },
          { type: deleteTopic.pending.type },
          { type: deleteTopic.pending.type },
          { type: deleteTopics.fulfilled.type },
        ]);
      });
    });
    describe('recreateTopic', () => {
      const recreateResponse = {
        cleanUpPolicy: 'DELETE',
        inSyncReplicas: 1,
        internal: false,
        name: topicName,
        partitionCount: 1,
        partitions: undefined,
        replicas: 1,
        replicationFactor: 1,
        segmentCount: 0,
        segmentSize: 0,
        underReplicatedPartitions: undefined,
      };
      it('recreateTopic/fulfilled', async () => {
        fetchMock.postOnce(
          `/api/clusters/${clusterName}/topics/${topicName}`,
          recreateResponse
        );
        await store.dispatch(recreateTopic({ clusterName, topicName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: recreateTopic.pending.type },
          {
            type: recreateTopic.fulfilled.type,
            payload: { [topicName]: { ...recreateResponse } },
          },
        ]);
      });
      it('recreateTopic/rejected', async () => {
        fetchMock.postOnce(
          `/api/clusters/${clusterName}/topics/${topicName}`,
          404
        );
        await store.dispatch(recreateTopic({ clusterName, topicName }));

        expect(getTypeAndPayload(store)).toEqual([
          { type: recreateTopic.pending.type },
          {
            type: recreateTopic.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics/${topicName}`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('fetchTopicConsumerGroups', () => {
      const consumerGroups = [
        {
          groupId: 'groupId1',
          members: 0,
          topics: 1,
          simple: false,
          partitionAssignor: '',
          coordinator: {
            id: 1,
            port: undefined,
            host: 'host',
          },
          messagesBehind: undefined,
          state: undefined,
        },
        {
          groupId: 'groupId2',
          members: 0,
          topics: 1,
          simple: false,
          partitionAssignor: '',
          coordinator: {
            id: 1,
            port: undefined,
            host: 'host',
          },
          messagesBehind: undefined,
          state: undefined,
        },
      ];
      it('fetchTopicConsumerGroups/fulfilled', async () => {
        fetchMock.getOnce(
          `/api/clusters/${clusterName}/topics/${topicName}/consumer-groups`,
          consumerGroups
        );
        await store.dispatch(
          fetchTopicConsumerGroups({ clusterName, topicName })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: fetchTopicConsumerGroups.pending.type },
          {
            type: fetchTopicConsumerGroups.fulfilled.type,
            payload: { consumerGroups, topicName },
          },
        ]);
      });
      it('fetchTopicConsumerGroups/rejected', async () => {
        fetchMock.getOnce(
          `/api/clusters/${clusterName}/topics/${topicName}/consumer-groups`,
          404
        );
        await store.dispatch(
          fetchTopicConsumerGroups({ clusterName, topicName })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: fetchTopicConsumerGroups.pending.type },
          {
            type: fetchTopicConsumerGroups.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics/${topicName}/consumer-groups`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('updateTopicPartitionsCount', () => {
      it('updateTopicPartitionsCount/fulfilled', async () => {
        fetchMock.patchOnce(
          `/api/clusters/${clusterName}/topics/${topicName}/partitions`,
          { message: 'success' }
        );
        await store.dispatch(
          updateTopicPartitionsCount({
            clusterName,
            topicName,
            partitions: 1,
          })
        );
        expect(getTypeAndPayload(store)).toEqual([
          { type: updateTopicPartitionsCount.pending.type },
          { type: showSuccessAlert.pending.type },
          {
            type: alertAdded.type,
            payload: {
              id: 'message-topic-local-1',
              title: '',
              type: 'success',
              createdAt: global.Date.now(),
              message: 'Number of partitions successfully increased!',
            },
          },
          { type: fetchTopicDetails.pending.type },
          { type: showSuccessAlert.fulfilled.type },
          {
            type: updateTopicPartitionsCount.fulfilled.type,
          },
        ]);
      });
      it('updateTopicPartitionsCount/rejected', async () => {
        fetchMock.patchOnce(
          `/api/clusters/${clusterName}/topics/${topicName}/partitions`,
          404
        );
        await store.dispatch(
          updateTopicPartitionsCount({
            clusterName,
            topicName,
            partitions: 1,
          })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: updateTopicPartitionsCount.pending.type },
          {
            type: updateTopicPartitionsCount.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics/${topicName}/partitions`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('updateTopicReplicationFactor', () => {
      it('updateTopicReplicationFactor/fulfilled', async () => {
        fetchMock.patchOnce(
          `/api/clusters/${clusterName}/topics/${topicName}/replications`,
          { message: 'success' }
        );
        await store.dispatch(
          updateTopicReplicationFactor({
            clusterName,
            topicName,
            replicationFactor: 1,
          })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: updateTopicReplicationFactor.pending.type },
          {
            type: updateTopicReplicationFactor.fulfilled.type,
          },
        ]);
      });
      it('updateTopicReplicationFactor/rejected', async () => {
        fetchMock.patchOnce(
          `/api/clusters/${clusterName}/topics/${topicName}/replications`,
          404
        );
        await store.dispatch(
          updateTopicReplicationFactor({
            clusterName,
            topicName,
            replicationFactor: 1,
          })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: updateTopicReplicationFactor.pending.type },
          {
            type: updateTopicReplicationFactor.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics/${topicName}/replications`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('createTopic', () => {
      const newTopic = {
        name: 'newTopic',
        partitions: 0,
        replicationFactor: 0,
        minInsyncReplicas: 0,
        cleanupPolicy: 'DELETE',
        retentionMs: 1,
        retentionBytes: 1,
        maxMessageBytes: 1,
        customParams: [
          {
            name: '',
            value: '',
          },
        ],
      };
      it('createTopic/fulfilled', async () => {
        fetchMock.postOnce(`/api/clusters/${clusterName}/topics`, {
          message: 'success',
        });
        await store.dispatch(
          createTopic({
            clusterName,
            data: newTopic,
          })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: createTopic.pending.type },
          {
            type: createTopic.fulfilled.type,
          },
        ]);
      });
      it('createTopic/rejected', async () => {
        fetchMock.postOnce(`/api/clusters/${clusterName}/topics`, 404);
        await store.dispatch(
          createTopic({
            clusterName,
            data: newTopic,
          })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: createTopic.pending.type },
          {
            type: createTopic.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('updateTopic', () => {
      const updateTopicResponse = {
        name: topicName,
        partitions: 0,
        replicationFactor: 0,
        minInsyncReplicas: 0,
        cleanupPolicy: 'DELETE',
        retentionMs: 0,
        retentionBytes: 0,
        maxMessageBytes: 0,
        customParams: {
          byIndex: {},
          allIndexes: [],
        },
      };
      it('updateTopic/fulfilled', async () => {
        fetchMock.patchOnce(
          `/api/clusters/${clusterName}/topics/${topicName}`,
          createTopicResponsePayload
        );
        await store.dispatch(
          updateTopic({
            clusterName,
            topicName,
            form: updateTopicResponse,
          })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: updateTopic.pending.type },
          {
            type: updateTopic.fulfilled.type,
            payload: { [topicName]: { ...createTopicResponsePayload } },
          },
        ]);
      });
      it('updateTopic/rejected', async () => {
        fetchMock.patchOnce(
          `/api/clusters/${clusterName}/topics/${topicName}`,
          404
        );
        await store.dispatch(
          updateTopic({
            clusterName,
            topicName,
            form: updateTopicResponse,
          })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: updateTopic.pending.type },
          {
            type: updateTopic.rejected.type,
            payload: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/topics/${topicName}`,
              message: undefined,
            },
          },
        ]);
      });
    });
    describe('clearTopicsMessages', () => {
      it('clearTopicsMessages/fulfilled', async () => {
        fetchMock.deleteOnce(
          `/api/clusters/${clusterName}/topics/${topicName}/messages`,
          [topicName, 'topic2']
        );
        await store.dispatch(
          clearTopicsMessages({
            clusterName,
            topicNames: [topicName, 'topic2'],
          })
        );

        expect(getTypeAndPayload(store)).toEqual([
          { type: clearTopicsMessages.pending.type },
          { type: clearTopicsMessages.fulfilled.type },
        ]);
      });
    });
  });
});
