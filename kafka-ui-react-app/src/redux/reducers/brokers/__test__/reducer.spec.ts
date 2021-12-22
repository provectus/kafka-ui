import fetchMock from 'fetch-mock-jest';
import reducer, {
  initialState,
  fetchBrokers,
  fetchClusterStats,
} from 'redux/reducers/brokers/brokersSlice';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';

import {
  brokersPayload,
  clusterStatsPayload,
  initialBrokersReducerState,
  updatedBrokersReducerState,
} from './fixtures';

const store = mockStoreCreator;
const clusterName = 'test-sluster-name';

describe('Brokers slice', () => {
  describe('reducer', () => {
    it('returns the initial state', () => {
      expect(reducer(undefined, { type: fetchBrokers.pending })).toEqual(
        initialState
      );
    });
    it('reacts on fetchBrokers.fullfiled and returns payload', () => {
      expect(
        reducer(initialState, {
          type: fetchBrokers.fulfilled,
          payload: brokersPayload,
        })
      ).toEqual({
        ...initialState,
        items: brokersPayload,
      });
    });
    it('reacts on fetchClusterStats.fullfiled and returns payload', () => {
      expect(
        reducer(initialBrokersReducerState, {
          type: fetchClusterStats.fulfilled,
          payload: clusterStatsPayload,
        })
      ).toEqual(updatedBrokersReducerState);
    });
  });

  describe('thunks', () => {
    afterEach(() => {
      fetchMock.restore();
      store.clearActions();
    });

    describe('fetchBrokers', () => {
      it('creates fetchBrokers.fulfilled when broker are fetched', async () => {
        fetchMock.getOnce(
          `/api/clusters/${clusterName}/brokers`,
          brokersPayload
        );
        await store.dispatch(fetchBrokers(clusterName));
        expect(
          store.getActions().map(({ type, payload }) => ({ type, payload }))
        ).toEqual([
          { type: fetchBrokers.pending.type },
          {
            type: fetchBrokers.fulfilled.type,
            payload: brokersPayload,
          },
        ]);
      });

      it('creates fetchBrokers.rejected when fetched clusters', async () => {
        fetchMock.getOnce(`/api/clusters/${clusterName}/brokers`, 422);
        await store.dispatch(fetchBrokers(clusterName));
        expect(
          store.getActions().map(({ type, payload }) => ({ type, payload }))
        ).toEqual([
          { type: fetchBrokers.pending.type },
          { type: fetchBrokers.rejected.type },
        ]);
      });
    });

    describe('fetchClusterStats', () => {
      it('creates fetchClusterStats.fulfilled when broker are fetched', async () => {
        fetchMock.getOnce(
          `/api/clusters/${clusterName}/stats`,
          clusterStatsPayload
        );
        await store.dispatch(fetchClusterStats(clusterName));
        expect(
          store.getActions().map(({ type, payload }) => ({ type, payload }))
        ).toEqual([
          { type: fetchClusterStats.pending.type },
          {
            type: fetchClusterStats.fulfilled.type,
            payload: clusterStatsPayload,
          },
        ]);
      });

      it('creates fetchClusterStats.rejected when fetched clusters', async () => {
        fetchMock.getOnce(`/api/clusters/${clusterName}/stats`, 422);
        await store.dispatch(fetchClusterStats(clusterName));
        expect(
          store.getActions().map(({ type, payload }) => ({ type, payload }))
        ).toEqual([
          { type: fetchClusterStats.pending.type },
          { type: fetchClusterStats.rejected.type },
        ]);
      });
    });
  });
});
