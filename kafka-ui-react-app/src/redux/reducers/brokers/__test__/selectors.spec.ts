import { store } from 'redux/store';
import * as selectors from 'redux/reducers/brokers/selectors';
import { fetchBrokersAction, fetchClusterStatsAction } from 'redux/actions';

import { brokersPayload, brokerStatsPayload } from './fixtures';

const { dispatch, getState } = store;

describe('Brokers selectors', () => {
  describe('Initial State', () => {
    it('returns broker count', () => {
      expect(selectors.getBrokerCount(getState())).toEqual(0);
    });
    it('returns zooKeeper status', () => {
      expect(selectors.getZooKeeperStatus(getState())).toEqual(0);
    });
    it('returns active controllers', () => {
      expect(selectors.getActiveControllers(getState())).toEqual(0);
    });
    it('returns online partition count', () => {
      expect(selectors.getOnlinePartitionCount(getState())).toEqual(0);
    });
    it('returns offline partition count', () => {
      expect(selectors.getOfflinePartitionCount(getState())).toEqual(0);
    });
    it('returns in sync replicas count', () => {
      expect(selectors.getInSyncReplicasCount(getState())).toEqual(0);
    });
    it('returns out of sync replicas count', () => {
      expect(selectors.getOutOfSyncReplicasCount(getState())).toEqual(0);
    });
    it('returns under replicated partition count', () => {
      expect(selectors.getUnderReplicatedPartitionCount(getState())).toEqual(0);
    });
    it('returns disk usage', () => {
      expect(selectors.getDiskUsage(getState())).toEqual([]);
    });
    it('returns version', () => {
      expect(selectors.getVersion(getState())).toBeUndefined();
    });
  });

  describe('state', () => {
    beforeAll(() => {
      dispatch(fetchBrokersAction.success(brokersPayload));
      dispatch(fetchClusterStatsAction.success(brokerStatsPayload));
    });

    it('returns broker count', () => {
      expect(selectors.getBrokerCount(getState())).toEqual(2);
    });
    it('returns zooKeeper status', () => {
      expect(selectors.getZooKeeperStatus(getState())).toEqual(1);
    });
    it('returns active controllers', () => {
      expect(selectors.getActiveControllers(getState())).toEqual(1);
    });
    it('returns online partition count', () => {
      expect(selectors.getOnlinePartitionCount(getState())).toEqual(138);
    });
    it('returns offline partition count', () => {
      expect(selectors.getOfflinePartitionCount(getState())).toEqual(0);
    });
    it('returns in sync replicas count', () => {
      expect(selectors.getInSyncReplicasCount(getState())).toEqual(239);
    });
    it('returns out of sync replicas count', () => {
      expect(selectors.getOutOfSyncReplicasCount(getState())).toEqual(0);
    });
    it('returns under replicated partition count', () => {
      expect(selectors.getUnderReplicatedPartitionCount(getState())).toEqual(0);
    });
    it('returns disk usage', () => {
      expect(selectors.getDiskUsage(getState())).toEqual([
        { brokerId: 1, segmentCount: 118, segmentSize: 16848434 },
        { brokerId: 2, segmentCount: 121, segmentSize: 12345678 },
      ]);
    });
    it('returns version', () => {
      expect(selectors.getVersion(getState())).toEqual('2.2.1');
    });
  });
});
