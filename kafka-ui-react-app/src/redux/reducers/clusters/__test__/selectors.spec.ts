import { fetchClusterListAction } from 'redux/actions';
import { store } from 'redux/store';
import * as selectors from 'redux/reducers/clusters/selectors';

import {
  clustersPayload,
  offlineClusterPayload,
  onlineClusterPayload,
} from './fixtures';

describe('Clusters selectors', () => {
  describe('Initial State', () => {
    it('returns fetch status', () => {
      expect(selectors.getIsClusterListFetched(store.getState())).toBeFalsy();
    });

    it('returns cluster list', () => {
      expect(selectors.getClusterList(store.getState())).toEqual([]);
    });

    it('returns online cluster list', () => {
      expect(selectors.getOnlineClusters(store.getState())).toEqual([]);
    });

    it('returns offline cluster list', () => {
      expect(selectors.getOfflineClusters(store.getState())).toEqual([]);
    });
  });

  describe('state', () => {
    beforeAll(() => {
      store.dispatch(fetchClusterListAction.success(clustersPayload));
    });

    it('returns fetch status', () => {
      expect(selectors.getIsClusterListFetched(store.getState())).toBeTruthy();
    });

    it('returns cluster list', () => {
      expect(selectors.getClusterList(store.getState())).toEqual(
        clustersPayload
      );
    });

    it('returns online cluster list', () => {
      expect(selectors.getOnlineClusters(store.getState())).toEqual([
        onlineClusterPayload,
      ]);
    });

    it('returns offline cluster list', () => {
      expect(selectors.getOfflineClusters(store.getState())).toEqual([
        offlineClusterPayload,
      ]);
    });
  });
});
