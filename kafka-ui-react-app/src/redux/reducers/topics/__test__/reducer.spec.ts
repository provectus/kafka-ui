import { TopicColumnsToSort } from 'generated-sources';
import {
  deleteTopicAction,
  clearMessagesTopicAction,
  setTopicsSearchAction,
  setTopicsOrderByAction,
  fetchTopicConsumerGroupsAction,
} from 'redux/actions';
import reducer from 'redux/reducers/topics/reducer';

const topic = {
  name: 'topic',
  id: 'id',
};

const state = {
  byName: {
    [topic.name]: topic,
  },
  allNames: [topic.name],
  messages: [],
  totalPages: 1,
  search: '',
  orderBy: null,
  consumerGroups: [],
};

describe('topics reducer', () => {
  describe('delete topic', () => {
    it('deletes the topic from the list on DELETE_TOPIC__SUCCESS', () => {
      expect(reducer(state, deleteTopicAction.success(topic.name))).toEqual({
        ...state,
        byName: {},
        allNames: [],
        consumerGroups: [],
      });
    });

    it('delete topic messages on CLEAR_TOPIC_MESSAGES__SUCCESS', () => {
      expect(
        reducer(state, clearMessagesTopicAction.success(topic.name))
      ).toEqual(state);
    });
  });

  describe('search topics', () => {
    it('sets the search string', () => {
      expect(reducer(state, setTopicsSearchAction('test'))).toEqual({
        ...state,
        search: 'test',
      });
    });
  });

  describe('order topics', () => {
    it('sets the orderBy', () => {
      expect(
        reducer(state, setTopicsOrderByAction(TopicColumnsToSort.NAME))
      ).toEqual({
        ...state,
        orderBy: TopicColumnsToSort.NAME,
      });
    });
  });

  describe('topic consumer groups', () => {
    it('GET_TOPIC_CONSUMER_GROUPS__SUCCESS', () => {
      expect(
        reducer(state, fetchTopicConsumerGroupsAction.success(state))
      ).toEqual(state);
    });
  });
});
