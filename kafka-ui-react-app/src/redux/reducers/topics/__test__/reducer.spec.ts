import { deleteTopicAction, clearMessagesTopicAction } from 'redux/actions';
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
};

describe('topics reducer', () => {
  it('deletes the topic from the list on DELETE_TOPIC__SUCCESS', () => {
    expect(reducer(state, deleteTopicAction.success(topic.name))).toEqual({
      byName: {},
      allNames: [],
      messages: [],
      totalPages: 1,
    });
  });

  it('delete topic messages on CLEAR_TOPIC_MESSAGES__SUCCESS', () => {
    expect(
      reducer(state, clearMessagesTopicAction.success(topic.name))
    ).toEqual(state);
  });
});
