import * as actions from '../actions';

describe('Actions', () => {
  describe('fetchClusterStatsAction', () => {
    it('creates an REQUEST action', () => {
      expect(actions.fetchClusterStatsAction.request()).toEqual({
        type: 'GET_CLUSTER_STATUS__REQUEST',
      });
    });

    it('creates an SUCCESS action', () => {
      expect(
        actions.fetchClusterStatsAction.success({ brokerCount: 1 })
      ).toEqual({
        type: 'GET_CLUSTER_STATUS__SUCCESS',
        payload: {
          brokerCount: 1,
        },
      });
    });

    it('creates an FAILURE action', () => {
      expect(actions.fetchClusterStatsAction.failure()).toEqual({
        type: 'GET_CLUSTER_STATUS__FAILURE',
      });
    });
  });
});
