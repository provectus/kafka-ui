import fetchMock from 'fetch-mock-jest';
import { ConnectorAction } from 'generated-sources';
import * as actions from 'redux/actions/actions';
import * as thunks from 'redux/actions/thunks';
import {
  connects,
  connectorsServerPayload,
  connectors,
  connectorServerPayload,
  connector,
  tasksServerPayload,
  tasks,
} from 'redux/reducers/connect/__test__/fixtures';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';

const store = mockStoreCreator;
const clusterName = 'local';
const connectName = 'first';
const connectorName = 'hdfs-source-connector';
const taskId = 10;

describe('Thunks', () => {
  afterEach(() => {
    fetchMock.restore();
    store.clearActions();
  });

  describe('fetchConnects', () => {
    it('creates GET_CONNECTS__SUCCESS when fetching connects', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/connects`, connects);
      await store.dispatch(thunks.fetchConnects(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchConnectsAction.request(),
        actions.fetchConnectsAction.success({ connects }),
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
            title: 'Kafka Connect',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects`,
            },
          },
        }),
      ]);
    });
  });

  describe('fetchConnectors', () => {
    it('creates GET_CONNECTORS__SUCCESS when fetching connectors', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connectors`,
        connectorsServerPayload,
        { query: { search: '' } }
      );
      await store.dispatch(thunks.fetchConnectors(clusterName));
      expect(store.getActions()).toEqual([
        actions.fetchConnectorsAction.request(),
        actions.fetchConnectorsAction.success({ connectors }),
      ]);
    });

    it('creates GET_CONNECTORS__SUCCESS when fetching connectors in silent mode', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connectors`,
        connectorsServerPayload,
        { query: { search: '' } }
      );
      await store.dispatch(thunks.fetchConnectors(clusterName, '', true));
      expect(store.getActions()).toEqual([
        actions.fetchConnectorsAction.success({
          ...store.getState().connect,
          connectors,
        }),
      ]);
    });

    it('creates GET_CONNECTORS__FAILURE', async () => {
      fetchMock.getOnce(`/api/clusters/${clusterName}/connectors`, 404, {
        query: { search: '' },
      });
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
              url: `/api/clusters/${clusterName}/connectors?search=`,
            },
          },
        }),
      ]);
    });
  });

  describe('fetchConnector', () => {
    it('creates GET_CONNECTOR__SUCCESS when fetching connects', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
        connectorServerPayload
      );
      await store.dispatch(
        thunks.fetchConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.fetchConnectorAction.request(),
        actions.fetchConnectorAction.success({ connector }),
      ]);
    });

    it('creates GET_CONNECTOR__FAILURE', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
        404
      );
      await store.dispatch(
        thunks.fetchConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.fetchConnectorAction.request(),
        actions.fetchConnectorAction.failure({
          alert: {
            subject: 'local-first-hdfs-source-connector',
            title: 'Kafka Connect Connector',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
            },
          },
        }),
      ]);
    });
  });

  describe('createConnector', () => {
    it('creates POST_CONNECTOR__SUCCESS when fetching connects', async () => {
      fetchMock.postOnce(
        {
          url: `/api/clusters/${clusterName}/connects/${connectName}/connectors`,
          body: {
            name: connectorName,
            config: connector.config,
          },
        },
        connectorServerPayload
      );
      await store.dispatch(
        thunks.createConnector(clusterName, connectName, {
          name: connectorName,
          config: connector.config,
        })
      );
      expect(store.getActions()).toEqual([
        actions.createConnectorAction.request(),
        actions.createConnectorAction.success({ connector }),
      ]);
    });

    it('creates POST_CONNECTOR__FAILURE', async () => {
      fetchMock.postOnce(
        {
          url: `/api/clusters/${clusterName}/connects/${connectName}/connectors`,
          body: {
            name: connectorName,
            config: connector.config,
          },
        },
        404
      );
      await store.dispatch(
        thunks.createConnector(clusterName, connectName, {
          name: connectorName,
          config: connector.config,
        })
      );
      expect(store.getActions()).toEqual([
        actions.createConnectorAction.request(),
        actions.createConnectorAction.failure({
          alert: {
            subject: 'local-first',
            title: 'Kafka Connect Connector Create',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects/${connectName}/connectors`,
            },
          },
        }),
      ]);
    });
  });

  describe('deleteConnector', () => {
    it('creates DELETE_CONNECTOR__SUCCESS', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
        {}
      );
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connectors?search=`,
        connectorsServerPayload
      );
      await store.dispatch(
        thunks.deleteConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.deleteConnectorAction.request(),
        actions.deleteConnectorAction.success({ connectorName }),
      ]);
    });

    it('creates DELETE_CONNECTOR__FAILURE', async () => {
      fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
        404
      );
      try {
        await store.dispatch(
          thunks.deleteConnector(clusterName, connectName, connectorName)
        );
      } catch {
        expect(store.getActions()).toEqual([
          actions.deleteConnectorAction.request(),
          actions.deleteConnectorAction.failure({
            alert: {
              subject: 'local-first-hdfs-source-connector',
              title: 'Kafka Connect Connector Delete',
              response: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
              },
            },
          }),
        ]);
      }
    });
  });

  describe('fetchConnectorTasks', () => {
    it('creates GET_CONNECTOR_TASKS__SUCCESS when fetching connects', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
        tasksServerPayload
      );
      await store.dispatch(
        thunks.fetchConnectorTasks(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.fetchConnectorTasksAction.request(),
        actions.fetchConnectorTasksAction.success({ tasks }),
      ]);
    });

    it('creates GET_CONNECTOR_TASKS__FAILURE', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
        404
      );
      await store.dispatch(
        thunks.fetchConnectorTasks(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.fetchConnectorTasksAction.request(),
        actions.fetchConnectorTasksAction.failure({
          alert: {
            subject: 'local-first-hdfs-source-connector',
            title: 'Kafka Connect Connector Tasks',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
            },
          },
        }),
      ]);
    });
  });

  describe('restartConnector', () => {
    it('creates RESTART_CONNECTOR__SUCCESS when fetching connects', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESTART}`,
        { message: 'success' }
      );
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
        tasksServerPayload
      );
      await store.dispatch(
        thunks.restartConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.restartConnectorAction.request(),
        actions.restartConnectorAction.success(),
      ]);
    });

    it('creates RESTART_CONNECTOR__FAILURE', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESTART}`,
        404
      );
      await store.dispatch(
        thunks.restartConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.restartConnectorAction.request(),
        actions.restartConnectorAction.failure({
          alert: {
            subject: 'local-first-hdfs-source-connector',
            title: 'Kafka Connect Connector Tasks Restart',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESTART}`,
            },
          },
        }),
      ]);
    });
  });

  describe('pauseConnector', () => {
    it('creates PAUSE_CONNECTOR__SUCCESS when fetching connects', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.PAUSE}`,
        { message: 'success' }
      );
      await store.dispatch(
        thunks.pauseConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.pauseConnectorAction.request(),
        actions.pauseConnectorAction.success({ connectorName }),
      ]);
    });

    it('creates PAUSE_CONNECTOR__FAILURE', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.PAUSE}`,
        404
      );
      await store.dispatch(
        thunks.pauseConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.pauseConnectorAction.request(),
        actions.pauseConnectorAction.failure({
          alert: {
            subject: 'local-first-hdfs-source-connector',
            title: 'Kafka Connect Connector Pause',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.PAUSE}`,
            },
          },
        }),
      ]);
    });
  });

  describe('resumeConnector', () => {
    it('creates RESUME_CONNECTOR__SUCCESS when fetching connects', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESUME}`,
        { message: 'success' }
      );
      await store.dispatch(
        thunks.resumeConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.resumeConnectorAction.request(),
        actions.resumeConnectorAction.success({ connectorName }),
      ]);
    });

    it('creates RESUME_CONNECTOR__FAILURE', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESUME}`,
        404
      );
      await store.dispatch(
        thunks.resumeConnector(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.resumeConnectorAction.request(),
        actions.resumeConnectorAction.failure({
          alert: {
            subject: 'local-first-hdfs-source-connector',
            title: 'Kafka Connect Connector Resume',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESUME}`,
            },
          },
        }),
      ]);
    });
  });

  describe('restartConnectorTask', () => {
    it('creates RESTART_CONNECTOR_TASK__SUCCESS when fetching connects', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks/${taskId}/action/restart`,
        { message: 'success' }
      );
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
        tasksServerPayload
      );
      await store.dispatch(
        thunks.restartConnectorTask(
          clusterName,
          connectName,
          connectorName,
          taskId
        )
      );
      expect(store.getActions()).toEqual([
        actions.restartConnectorTaskAction.request(),
        actions.restartConnectorTaskAction.success(),
      ]);
    });

    it('creates RESTART_CONNECTOR_TASK__FAILURE', async () => {
      fetchMock.postOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks/${taskId}/action/restart`,
        404
      );
      await store.dispatch(
        thunks.restartConnectorTask(
          clusterName,
          connectName,
          connectorName,
          taskId
        )
      );
      expect(store.getActions()).toEqual([
        actions.restartConnectorTaskAction.request(),
        actions.restartConnectorTaskAction.failure({
          alert: {
            subject: 'local-first-hdfs-source-connector-10',
            title: 'Kafka Connect Connector Task Restart',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks/${taskId}/action/restart`,
            },
          },
        }),
      ]);
    });
  });

  describe('fetchConnectorConfig', () => {
    it('creates GET_CONNECTOR_CONFIG__SUCCESS when fetching connects', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
        connector.config
      );
      await store.dispatch(
        thunks.fetchConnectorConfig(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.fetchConnectorConfigAction.request(),
        actions.fetchConnectorConfigAction.success({
          config: connector.config,
        }),
      ]);
    });

    it('creates GET_CONNECTOR_CONFIG__FAILURE', async () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
        404
      );
      await store.dispatch(
        thunks.fetchConnectorConfig(clusterName, connectName, connectorName)
      );
      expect(store.getActions()).toEqual([
        actions.fetchConnectorConfigAction.request(),
        actions.fetchConnectorConfigAction.failure({
          alert: {
            subject: 'local-first-hdfs-source-connector',
            title: 'Kafka Connect Connector Config',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
            },
          },
        }),
      ]);
    });
  });

  describe('updateConnectorConfig', () => {
    it('creates PATCH_CONNECTOR_CONFIG__SUCCESS when fetching connects', async () => {
      fetchMock.putOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
        connectorServerPayload
      );
      await store.dispatch(
        thunks.updateConnectorConfig(
          clusterName,
          connectName,
          connectorName,
          connector.config
        )
      );
      expect(store.getActions()).toEqual([
        actions.updateConnectorConfigAction.request(),
        actions.updateConnectorConfigAction.success({ connector }),
      ]);
    });

    it('creates PATCH_CONNECTOR_CONFIG__FAILURE', async () => {
      fetchMock.putOnce(
        `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
        404
      );
      await store.dispatch(
        thunks.updateConnectorConfig(
          clusterName,
          connectName,
          connectorName,
          connector.config
        )
      );
      expect(store.getActions()).toEqual([
        actions.updateConnectorConfigAction.request(),
        actions.updateConnectorConfigAction.failure({
          alert: {
            subject: 'local-first-hdfs-source-connector',
            title: 'Kafka Connect Connector Config Update',
            response: {
              status: 404,
              statusText: 'Not Found',
              url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
            },
          },
        }),
      ]);
    });
  });
});
