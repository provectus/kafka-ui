import { store } from 'redux/store';
import {
  fetchClusters,
  getAreClustersFulfilled,
  getClusterList,
  getOnlineClusters,
  getOfflineClusters,
} from 'redux/reducers/clusters/clustersSlice';

import {
  clustersPayload,
  offlineClusterPayload,
  onlineClusterPayload,
} from './fixtures';

describe('Clusters selectors', () => {
  describe('Initial State', () => {
    it('returns fetch status', () => {
      expect(getAreClustersFulfilled(store.getState())).toBeFalsy();
    });

    it('returns cluster list', () => {
      expect(getClusterList(store.getState())).toEqual([]);
    });

    it('returns online cluster list', () => {
      expect(getOnlineClusters(store.getState())).toEqual([]);
    });

    it('returns offline cluster list', () => {
      expect(getOfflineClusters(store.getState())).toEqual([]);
    });
  });

  describe('state', () => {
    beforeAll(() => {
      store.dispatch(fetchClusters.fulfilled(clustersPayload, '1234'));
    });

    it('returns fetch status', () => {
      expect(getAreClustersFulfilled(store.getState())).toBeTruthy();
    });

    it('returns cluster list', () => {
      expect(getClusterList(store.getState())).toEqual(clustersPayload);
    });

    it('returns online cluster list', () => {
      expect(getOnlineClusters(store.getState())).toEqual([
        onlineClusterPayload,
      ]);
    });

    it('returns offline cluster list', () => {
      expect(getOfflineClusters(store.getState())).toEqual([
        offlineClusterPayload,
      ]);
    });
  });
});
