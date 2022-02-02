import { store } from 'redux/store';
import * as selectors from 'redux/reducers/topicMessages/selectors';
import { initialState } from 'redux/reducers/topicMessages/reducer';
import {
  addTopicMessage,
  updateTopicMessagesMeta,
  updateTopicMessagesPhase,
} from 'redux/actions';

import { topicMessagePayload, topicMessagesMetaPayload } from './fixtures';

describe('TopicMessages selectors', () => {
  describe('Initial state', () => {
    it('returns empty message array', () => {
      expect(selectors.getTopicMessges(store.getState())).toEqual([]);
    });

    it('returns undefined phase', () => {
      expect(selectors.getTopicMessgesPhase(store.getState())).toBeUndefined();
    });

    it('returns initial vesrion of meta', () => {
      expect(selectors.getTopicMessgesMeta(store.getState())).toEqual(
        initialState.meta
      );
    });
  });

  describe('state', () => {
    beforeAll(() => {
      store.dispatch(addTopicMessage(topicMessagePayload));
      store.dispatch(updateTopicMessagesPhase('consuming'));
      store.dispatch(updateTopicMessagesMeta(topicMessagesMetaPayload));
    });

    it('returns messages', () => {
      expect(selectors.getTopicMessges(store.getState())).toEqual([
        topicMessagePayload,
      ]);
    });

    it('returns phase', () => {
      expect(selectors.getTopicMessgesPhase(store.getState())).toEqual(
        'consuming'
      );
    });

    it('returns ordered versions of schema', () => {
      expect(selectors.getTopicMessgesMeta(store.getState())).toEqual(
        topicMessagesMetaPayload
      );
    });
  });
});
