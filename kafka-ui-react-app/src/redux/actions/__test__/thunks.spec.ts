import configureMockStore, {
  MockStoreCreator,
  MockStoreEnhanced,
} from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import fetchMock from 'fetch-mock-jest';
import { Middleware } from 'redux';
import { RootState, Action } from 'redux/interfaces';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import * as fixtures from './fixtures';

const middlewares: Array<Middleware> = [thunk];
type DispatchExts = ThunkDispatch<RootState, undefined, Action>;

const mockStoreCreator: MockStoreCreator<
  RootState,
  DispatchExts
> = configureMockStore<RootState, DispatchExts>(middlewares);

const store: MockStoreEnhanced<RootState, DispatchExts> = mockStoreCreator();

const clusterName = 'local';

describe('Thunks', () => {
  afterEach(() => {
    fetchMock.restore();
    store.clearActions();
  });

  describe('fetchClusterStats', () => {
    it('creates GET_CLUSTER_STATUS__SUCCESS when fetching cluster stats', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/stats`, {
        body: fixtures.clusterStats,
      });
      await store.dispatch(thunks.fetchClusterStats(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchClusterStatsAction.request(),
        actions.fetchClusterStatsAction.success(fixtures.clusterStats),
      ]);
    });

    it('creates GET_CLUSTER_STATUS__FAILURE when fetching cluster stats', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/stats`, 404);
      await store.dispatch(thunks.fetchClusterStats(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchClusterStatsAction.request(),
        actions.fetchClusterStatsAction.failure(),
      ]);
    });
  });
});
