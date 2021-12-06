import fetchMock from 'fetch-mock-jest';
import reducer, { fetchClusters } from 'redux/reducers/clusters/clustersSlice';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';

import { clustersPayload } from './fixtures';

const store = mockStoreCreator;

describe('Clusters Slice', () => {
  describe('Reducer', () => {
    it('returns the initial state', () => {
      expect(reducer(undefined, { type: fetchClusters.pending })).toEqual([]);
    });

    it('reacts on fetchClusters.fulfilled and returns payload', () => {
      expect(
        reducer([], {
          type: fetchClusters.fulfilled,
          payload: clustersPayload,
        })
      ).toEqual(clustersPayload);
    });
  });

  describe('thunks', () => {
    afterEach(() => {
      fetchMock.restore();
      store.clearActions();
    });

    describe('fetchClusters', () => {
      it('creates fetchClusters.fulfilled when fetched clusters', async () => {
        fetchMock.getOnce('/api/clusters', clustersPayload);
        await store.dispatch(fetchClusters());
        expect(
          store.getActions().map(({ type, payload }) => ({ type, payload }))
        ).toEqual([
          { type: fetchClusters.pending.type },
          { type: fetchClusters.fulfilled.type, payload: clustersPayload },
        ]);
      });

      it('creates fetchClusters.fulfilled when fetched clusters', async () => {
        fetchMock.getOnce('/api/clusters', 422);
        await store.dispatch(fetchClusters());
        expect(
          store.getActions().map(({ type, payload }) => ({ type, payload }))
        ).toEqual([
          { type: fetchClusters.pending.type },
          { type: fetchClusters.rejected.type },
        ]);
      });
    });
  });
});
