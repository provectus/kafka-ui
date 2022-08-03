import { store } from 'redux/store';
import * as selectors from 'redux/reducers/topics/selectors';

describe('Topics selectors', () => {
  describe('Initial State', () => {
    it('returns initial values', () => {
      expect(selectors.getTopicListTotalPages(store.getState())).toEqual(1);
      expect(selectors.getIsTopicDeleted(store.getState())).toBeFalsy();
      expect(selectors.getAreTopicsFetching(store.getState())).toEqual(false);
      expect(selectors.getAreTopicsFetched(store.getState())).toEqual(false);
      expect(selectors.getIsTopicDetailsFetching(store.getState())).toEqual(
        false
      );
      expect(selectors.getIsTopicDetailsFetched(store.getState())).toEqual(
        false
      );
      expect(selectors.getTopicConfigFetched(store.getState())).toEqual(false);
      expect(selectors.getTopicCreated(store.getState())).toEqual(false);
      expect(selectors.getTopicUpdated(store.getState())).toEqual(false);
      expect(selectors.getTopicMessageSchemaFetched(store.getState())).toEqual(
        false
      );
      expect(
        selectors.getTopicsConsumerGroupsFetched(store.getState())
      ).toEqual(false);
      expect(selectors.getTopicList(store.getState())).toEqual([]);
    });
  });
});
