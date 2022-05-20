import {
  MessageSchemaSourceEnum,
  SortOrder,
  TopicColumnsToSort,
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
} from 'redux/reducers/topics/topicsSlice';
import { createTopicPayload } from 'components/Topics/New/__test__/fixtures';

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

describe('topics reducer', () => {
  const clusterName = 'local';

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
          payload: { clusterName, topicName: topic.name },
        })
      ).toEqual(state);
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
