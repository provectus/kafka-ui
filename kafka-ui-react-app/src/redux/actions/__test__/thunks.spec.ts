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
import * as fixtures from 'redux/reducers/schemas/__test__/fixtures';

const middlewares: Array<Middleware> = [thunk];
type DispatchExts = ThunkDispatch<RootState, undefined, Action>;

const mockStoreCreator: MockStoreCreator<
  RootState,
  DispatchExts
> = configureMockStore<RootState, DispatchExts>(middlewares);

const store: MockStoreEnhanced<RootState, DispatchExts> = mockStoreCreator();

const clusterName = 'local';
const subject = 'test';

describe('Thunks', () => {
  afterEach(() => {
    fetchMock.restore();
    store.clearActions();
  });

  describe('fetchSchemasByClusterName', () => {
    it('creates GET_CLUSTER_SCHEMAS__SUCCESS when fetching cluster schemas', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/schemas`, {
        body: fixtures.clusterSchemasPayload,
      });
      await store.dispatch(thunks.fetchSchemasByClusterName(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchSchemasByClusterNameAction.request(),
        actions.fetchSchemasByClusterNameAction.success(
          fixtures.clusterSchemasPayload
        ),
      ]);
    });

    it('creates GET_CLUSTER_SCHEMAS__FAILURE when fetching cluster schemas', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/schemas`, 404);
      await store.dispatch(thunks.fetchSchemasByClusterName(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchSchemasByClusterNameAction.request(),
        actions.fetchSchemasByClusterNameAction.failure(),
      ]);
    });
  });

  describe('fetchSchemaVersions', () => {
    it('creates GET_SCHEMA_VERSIONS__SUCCESS when fetching schema versions', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/schemas/${subject}/versions`,
        {
          body: fixtures.schemaVersionsPayload,
        }
      );
      await store.dispatch(thunks.fetchSchemaVersions(clusterName, subject));
      expect(store.getActions()).toEqual([
        actions.fetchSchemaVersionsAction.request(),
        actions.fetchSchemaVersionsAction.success(
          fixtures.schemaVersionsPayload
        ),
      ]);
    });

    it('creates GET_SCHEMA_VERSIONS__FAILURE when fetching schema versions', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/schemas/${subject}/versions`,
        404
      );
      await store.dispatch(thunks.fetchSchemaVersions(clusterName, subject));
      expect(store.getActions()).toEqual([
        actions.fetchSchemaVersionsAction.request(),
        actions.fetchSchemaVersionsAction.failure(),
      ]);
    });
  });
});
