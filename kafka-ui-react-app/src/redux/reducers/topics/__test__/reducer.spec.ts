import { deleteTopicAction } from 'redux/actions';
import reducer from 'redux/reducers/topics/reducer';

describe('topics reducer', () => {
  it('deletes the topic from the list on DELETE_TOPIC__SUCCESS', () => {
    const topic = {
      name: 'topic',
      id: 'id',
    };
    expect(
      reducer(
        {
          byName: {
            [topic.name]: topic,
          },
          allNames: [topic.name],
          messages: [],
          totalPages: 1,
        },
        deleteTopicAction.success(topic.name)
      )
    ).toEqual({
      byName: {},
      allNames: [],
      messages: [],
      totalPages: 1,
    });
  });
});
