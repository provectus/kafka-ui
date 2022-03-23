import { store } from 'redux/store';
import {
  sortBy,
  getConsumerGroupsOrderBy,
  getConsumerGroupsSortOrder,
  getAreConsumerGroupsPagedFulfilled,
  fetchConsumerGroupsPaged,
  selectAll,
} from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import { ConsumerGroupOrdering, SortOrder } from 'generated-sources';
import { consumerGroups } from 'redux/reducers/consumerGroups/__test__/fixtures';

describe('Consumer Groups Slice', () => {
  describe('Actions', () => {
    it('should test the sortBy actions', () => {
      expect(store.getState().consumerGroups.sortOrder).toBe(SortOrder.ASC);

      store.dispatch(sortBy(ConsumerGroupOrdering.STATE));
      expect(getConsumerGroupsOrderBy(store.getState())).toBe(
        ConsumerGroupOrdering.STATE
      );
      expect(getConsumerGroupsSortOrder(store.getState())).toBe(SortOrder.DESC);
      store.dispatch(sortBy(ConsumerGroupOrdering.STATE));
      expect(getConsumerGroupsSortOrder(store.getState())).toBe(SortOrder.ASC);
    });
  });

  describe('Thunk Actions', () => {
    it('should check the fetchConsumerPaged ', () => {
      store.dispatch({
        type: fetchConsumerGroupsPaged.fulfilled.type,
        payload: {
          consumerGroups,
        },
      });

      expect(getAreConsumerGroupsPagedFulfilled(store.getState())).toBeTruthy();
      expect(selectAll(store.getState())).toEqual(consumerGroups);

      store.dispatch({
        type: fetchConsumerGroupsPaged.fulfilled.type,
        payload: {
          consumerGroups: null,
        },
      });
      expect(selectAll(store.getState())).toEqual([]);
    });
  });
});
