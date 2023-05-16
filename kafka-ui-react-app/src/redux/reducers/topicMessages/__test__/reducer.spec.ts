import reducer, {
  addTopicMessage,
  resetTopicMessages,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
} from 'redux/reducers/topicMessages/topicMessagesSlice';

import {
  topicMessagePayload,
  topicMessagePayloadV2,
  topicMessagesMetaPayload,
} from './fixtures';

describe('TopicMessages reducer', () => {
  it('Adds new message', () => {
    const state = reducer(
      undefined,
      addTopicMessage({ message: topicMessagePayload })
    );
    expect(state.messages.length).toEqual(1);
  });

  it('Adds new message with live tailing one', () => {
    const state = reducer(
      undefined,
      addTopicMessage({ message: topicMessagePayload })
    );
    const modifiedState = reducer(
      state,
      addTopicMessage({ message: topicMessagePayloadV2, prepend: true })
    );
    expect(modifiedState.messages.length).toEqual(2);
    expect(modifiedState.messages).toEqual([
      topicMessagePayloadV2,
      topicMessagePayload,
    ]);
  });

  it('Adds new message with live tailing off', () => {
    const state = reducer(
      undefined,
      addTopicMessage({ message: topicMessagePayload })
    );
    const modifiedState = reducer(
      state,
      addTopicMessage({ message: topicMessagePayloadV2 })
    );
    expect(modifiedState.messages.length).toEqual(2);
    expect(modifiedState.messages).toEqual([
      topicMessagePayload,
      topicMessagePayloadV2,
    ]);
  });

  it('reset messages', () => {
    const state = reducer(
      undefined,
      addTopicMessage({ message: topicMessagePayload })
    );
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
