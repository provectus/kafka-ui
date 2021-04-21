import fetchMock from 'fetch-mock-jest';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import {
  connectorsPayload,
  connectorsServerPayload,
  connectsPayload,
} from 'redux/reducers/connect/__test__/fixtures';
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
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connects`,
        connectsPayload
      );
      await store.dispatch(thunks.fetchConnects(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchConnectsAction.request(),
        actions.fetchConnectsAction.success({
          ...store.getState().connect,
          connects: connectsPayload,
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

  describe('fetchConnectors', () => {
    it('creates GET_CONNECTORS__SUCCESS when fetching connects', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connectors`,
        connectorsServerPayload
      );
      await store.dispatch(thunks.fetchConnectors(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchConnectorsAction.request(),
        actions.fetchConnectorsAction.success({
          ...store.getState().connect,
          connectors: connectorsPayload,
        }),
      ]);
    });

    it('creates GET_CONNECTORS__SUCCESS when fetching connects in silent mode', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connectors`,
        connectorsServerPayload
      );
      await store.dispatch(thunks.fetchConnectors(clusterName, true));
      expect(store.getActions()).toEqual([
        actions.fetchConnectorsAction.success({
          ...store.getState().connect,
          connectors: connectorsPayload,
        }),
      ]);
    });

    it('creates GET_CONNECTORS__FAILURE', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/connectors`, 404);
      await store.dispatch(thunks.fetchConnectors(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchConnectorsAction.request(),
        actions.fetchConnectorsAction.failure({
          alert: {
            subject: 'local-connectors',
            title: 'Kafka Connect Connectors',
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

  describe('deleteConnector', () => {
    const connectName = 'first';
    const connectorName = 'hdfs-source-connector';

    it('creates DELETE_CONNECTOR__SUCCESS', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
        {}
      );
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connectors`,
        connectorsServerPayload
      );
      await store.dispatch(
        thunks.deleteConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.deleteConnectorAction.request(),
        actions.deleteConnectorAction.success({
          ...store.getState().connect,
        }),
      ]);
    });

    it('creates DELETE_CONNECTOR__FAILURE', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
        404
      );
      await store.dispatch(
        thunks.deleteConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.deleteConnectorAction.request(),
        actions.deleteConnectorAction.failure({
          alert: {
            subject: 'local-first-hdfs-source-connector',
            title: 'Kafka Connect Connector Delete',
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
