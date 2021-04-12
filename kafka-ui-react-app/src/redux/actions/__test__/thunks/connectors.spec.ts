import fetchMock from 'fetch-mock-jest';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';

const store = mockStoreCreator;
const clusterName = 'local';

describe('Thunks', () => {
  afterEach(() => {
    fetchMock.restore();
    store.clearActions();
  });

  describe('fetchConnects', () => {
    it('creates GET_CONNECTS__SUCCESS when fetching connects', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/connects`, [
        { name: 'first', address: 'localhost' },
      ]);
      await store.dispatch(thunks.fetchConnects(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchConnectsAction.request(),
        actions.fetchConnectsAction.success({
          ...store.getState().connect,
          connects: [{ name: 'first', address: 'localhost' }],
        }),
      ]);
    });

    it('creates GET_CONNECTS__FAILURE', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/connects`, 404);
      await store.dispatch(thunks.fetchConnects(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchConnectsAction.request(),
        actions.fetchConnectsAction.failure({
          alert: {
            subject: 'connects',
            title: `Kafka Connect`,
            response: {
              status: 404,
              statusText: 'Not Found',
              body: undefined,
            },
          },
        }),
      ]);
    });
  });
});
