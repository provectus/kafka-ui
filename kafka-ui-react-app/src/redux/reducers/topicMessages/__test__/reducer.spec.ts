import {
  addTopicMessage,
  fetchSchemaVersionsAction,
  resetTopicMessages,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
} from 'redux/actions';
import reducer, { initialState } from 'redux/reducers/topicMessages/reducer';

import { topicMessagePayload, topicMessagesMetaPayload } from './fixtures';

describe('TopicMessages reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, fetchSchemaVersionsAction.request())).toEqual(
      initialState
    );
  });
  it('Adds new message', () => {
    const state = reducer(undefined, addTopicMessage(topicMessagePayload));
    expect(state.messages.length).toEqual(1);
    expect(state).toMatchSnapshot();
  });
  it('Clears messages', () => {
    const state = reducer(undefined, addTopicMessage(topicMessagePayload));
    expect(state.messages.length).toEqual(1);

    const newState = reducer(state, resetTopicMessages());
    expect(newState.messages.length).toEqual(0);
  });
  it('Updates Topic Messages Phase', () => {
    const phase = 'Polling';

    const state = reducer(undefined, updateTopicMessagesPhase(phase));
    expect(state.phase).toEqual(phase);
  });
  it('Updates Topic Messages Meta', () => {
    const state = reducer(
      undefined,
      updateTopicMessagesMeta(topicMessagesMetaPayload)
    );
    expect(state.meta).toEqual(topicMessagesMetaPayload);
  });
});
