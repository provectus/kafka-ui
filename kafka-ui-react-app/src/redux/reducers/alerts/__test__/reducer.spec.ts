import { dismissAlert, createTopicAction } from 'redux/actions';
import reducer from 'redux/reducers/alerts/reducer';
import { failurePayloadWithId, failurePayloadWithoutId } from './fixtures';

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  now: () => 1234567890,
}));

describe('Clusters reducer', () => {
  it('does not create error alert', () => {
    expect(reducer(undefined, createTopicAction.failure({}))).toEqual({});
  });

  it('creates error alert with subjectId', () => {
    expect(
      reducer(
        undefined,
        createTopicAction.failure({
          alert: failurePayloadWithId,
        })
      )
    ).toEqual({
      'alert-topic12345': {
        createdAt: 1234567890,
        id: 'alert-topic12345',
        message: 'message',
        response: undefined,
        title: 'title',
        type: 'error',
      },
    });
  });

  it('creates error alert without subjectId', () => {
    expect(
      reducer(
        undefined,
        createTopicAction.failure({
          alert: failurePayloadWithoutId,
        })
      )
    ).toEqual({
      'alert-topic': {
        createdAt: 1234567890,
        id: 'alert-topic',
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
        alert: failurePayloadWithoutId,
      })
    );
    expect(reducer(state, dismissAlert('alert-topic'))).toEqual({});
  });

  it('does not remove alert if id is wrong', () => {
    const state = reducer(
      undefined,
      createTopicAction.failure({
        alert: failurePayloadWithoutId,
      })
    );
    expect(reducer(state, dismissAlert('wrong-id'))).toEqual({
      'alert-topic': {
        createdAt: 1234567890,
        id: 'alert-topic',
        message: 'message',
        response: undefined,
        title: 'title',
        type: 'error',
      },
    });
  });
});
