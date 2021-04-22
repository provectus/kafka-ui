import { dismissAlert, createTopicAction } from 'redux/actions';
import reducer from 'redux/reducers/alerts/reducer';

import { failurePayload1, failurePayload2 } from './fixtures';

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  now: () => 1234567890,
}));

describe('Clusters reducer', () => {
  it('does not create error alert', () => {
    expect(reducer(undefined, createTopicAction.failure({}))).toEqual({});
  });

  it('creates error alert', () => {
    expect(
      reducer(
        undefined,
        createTopicAction.failure({
          alert: failurePayload2,
        })
      )
    ).toEqual({
      'POST_TOPIC__FAILURE-topic-2': {
        createdAt: 1234567890,
        id: 'POST_TOPIC__FAILURE-topic-2',
        message: 'message',
        response: undefined,
        title: 'title',
        type: 'error',
      },
    });
  });

  it('removes alert by ID', () => {
    const state = reducer(
      undefined,
      createTopicAction.failure({
        alert: failurePayload1,
      })
    );
    expect(reducer(state, dismissAlert('POST_TOPIC__FAILURE-topic-1'))).toEqual(
      {}
    );
  });

  it('does not remove alert if id is wrong', () => {
    const state = reducer(
      undefined,
      createTopicAction.failure({
        alert: failurePayload1,
      })
    );
    expect(reducer(state, dismissAlert('wrong-id'))).toEqual({
      'POST_TOPIC__FAILURE-topic-1': {
        createdAt: 1234567890,
        id: 'POST_TOPIC__FAILURE-topic-1',
        message: 'message',
        response: undefined,
        title: 'title',
        type: 'error',
      },
    });
  });
});
