import {
  ConnectorState,
  ConnectorTaskStatus,
  ConnectorAction,
} from 'generated-sources';
import reducer, {
  initialState,
  fetchConnects,
  fetchConnectors,
  fetchConnector,
  createConnector,
  deleteConnector,
  setConnectorStatusState,
  fetchConnectorTasks,
  fetchConnectorConfig,
  updateConnectorConfig,
  restartConnector,
  pauseConnector,
  resumeConnector,
  restartConnectorTask,
} from 'redux/reducers/connect/connectSlice';
import fetchMock from 'fetch-mock-jest';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';
import { getTypeAndPayload } from 'lib/testHelpers';

import {
  connects,
  connectors,
  connector,
  tasks,
  connectorsServerPayload,
  connectorServerPayload,
  tasksServerPayload,
} from './fixtures';

const runningConnectorState = {
  ...initialState,
  currentConnector: {
    ...initialState.currentConnector,
    connector: {
      ...connector,
      status: {
        ...connector.status,
        state: ConnectorState.RUNNING,
      },
    },
    tasks: tasks.map((task) => ({
      ...task,
      status: {
        ...task.status,
        state: ConnectorTaskStatus.RUNNING,
      },
    })),
  },
};

const pausedConnectorState = {
  ...initialState,
  currentConnector: {
    ...initialState.currentConnector,
    connector: {
      ...connector,
      status: {
        ...connector.status,
        state: ConnectorState.PAUSED,
      },
    },
    tasks: tasks.map((task) => ({
      ...task,
      status: {
        ...task.status,
        state: ConnectorTaskStatus.PAUSED,
      },
    })),
  },
};

describe('Connect slice', () => {
  describe('Reducer', () => {
    it('reacts on fetchConnects/fulfilled', () => {
      expect(
        reducer(initialState, {
          type: fetchConnects.fulfilled,
          payload: { connects },
        })
      ).toEqual({
        ...initialState,
        connects,
      });
    });

    it('reacts on fetchConnectors/fulfilled', () => {
      expect(
        reducer(initialState, {
          type: fetchConnectors.fulfilled,
          payload: { connectors },
        })
      ).toEqual({
        ...initialState,
        connectors,
      });
    });

    it('reacts on fetchConnector/fulfilled', () => {
      expect(
        reducer(initialState, {
          type: fetchConnector.fulfilled,
          payload: { connector },
        })
      ).toEqual({
        ...initialState,
        currentConnector: {
          ...initialState.currentConnector,
          connector,
        },
      });
    });

    it('reacts on createConnector/fulfilled', () => {
      expect(
        reducer(initialState, {
          type: createConnector.fulfilled,
          payload: { connector },
        })
      ).toEqual({
        ...initialState,
        currentConnector: {
          ...initialState.currentConnector,
          connector,
        },
      });
    });

    it('reacts on deleteConnector/fulfilled', () => {
      expect(
        reducer(
          { ...initialState, connectors },
          {
            type: deleteConnector.fulfilled,
            payload: { connectorName: connectors[0].name },
          }
        )
      ).toEqual({
        ...initialState,
        connectors: connectors.slice(1),
      });
    });

    it('reacts on setConnectorStatusState/fulfilled', () => {
      expect(
        reducer(runningConnectorState, {
          type: setConnectorStatusState,
          payload: {
            taskState: ConnectorTaskStatus.PAUSED,
            connectorState: ConnectorState.PAUSED,
          },
        })
      ).toEqual(pausedConnectorState);
    });

    it('reacts on fetchConnectorTasks/fulfilled', () => {
      expect(
        reducer(initialState, {
          type: fetchConnectorTasks.fulfilled,
          payload: { tasks },
        })
      ).toEqual({
        ...initialState,
        currentConnector: {
          ...initialState.currentConnector,
          tasks,
        },
      });
    });

    it('reacts on fetchConnectorConfig/fulfilled', () => {
      expect(
        reducer(initialState, {
          type: fetchConnectorConfig.fulfilled,
          payload: { config: connector.config },
        })
      ).toEqual({
        ...initialState,
        currentConnector: {
          ...initialState.currentConnector,
          config: connector.config,
        },
      });
    });

    it('reacts on updateConnectorConfig/fulfilled', () => {
      expect(
        reducer(
          {
            ...initialState,
            currentConnector: {
              ...initialState.currentConnector,
              config: {
                ...connector.config,
                fieldToRemove: 'Fake',
              },
            },
          },
          {
            type: updateConnectorConfig.fulfilled,
            payload: { connector },
          }
        )
      ).toEqual({
        ...initialState,
        currentConnector: {
          ...initialState.currentConnector,
          connector,
          config: connector.config,
        },
      });
    });
  });

  describe('Thunks', () => {
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
        it('creates fetchConnects/fulfilled when fetching connects', async () => {
          fetchMock.getOnce(`/api/clusters/${clusterName}/connects`, connects);
          await store.dispatch(fetchConnects(clusterName));

          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnects.pending.type },
            {
              type: fetchConnects.fulfilled.type,
              payload: { connects },
            },
          ]);
        });
        it('creates fetchConnects/rejected', async () => {
          fetchMock.getOnce(`/api/clusters/${clusterName}/connects`, 404);
          await store.dispatch(fetchConnects(clusterName));
          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnects.pending.type },
            {
              type: fetchConnects.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects`,
                message: undefined,
              },
            },
          ]);
        });
      });
      describe('fetchConnectors', () => {
        it('creates fetchConnectors/fulfilled when fetching connectors', async () => {
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connectors`,
            connectorsServerPayload,
            { query: { search: '' } }
          );
          await store.dispatch(fetchConnectors({ clusterName }));
          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnectors.pending.type },
            {
              type: fetchConnectors.fulfilled.type,
              payload: { connectors },
            },
          ]);
        });
        it('creates fetchConnectors/rejected', async () => {
          fetchMock.getOnce(`/api/clusters/${clusterName}/connectors`, 404, {
            query: { search: '' },
          });
          await store.dispatch(fetchConnectors({ clusterName }));
          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnectors.pending.type },
            {
              type: fetchConnectors.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connectors?search=`,
                message: undefined,
              },
            },
          ]);
        });
      });
      describe('fetchConnector', () => {
        it('creates fetchConnector/fulfilled when fetching connector', async () => {
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
            connectorServerPayload
          );
          await store.dispatch(
            fetchConnector({ clusterName, connectName, connectorName })
          );

          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnector.pending.type },
            {
              type: fetchConnector.fulfilled.type,
              payload: { connector },
            },
          ]);
        });
        it('creates fetchConnector/rejected', async () => {
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
            404
          );
          await store.dispatch(
            fetchConnector({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnector.pending.type },
            {
              type: fetchConnector.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
                message: undefined,
              },
            },
          ]);
        });
      });
      describe('createConnector', () => {
        it('creates createConnector/fulfilled when fetching connects', async () => {
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
            createConnector({
              clusterName,
              connectName,
              newConnector: {
                name: connectorName,
                config: connector.config,
              },
            })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: createConnector.pending.type },
            {
              type: createConnector.fulfilled.type,
              payload: { connector },
            },
          ]);
        });
        it('creates createConnector/rejected', async () => {
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
            createConnector({
              clusterName,
              connectName,
              newConnector: {
                name: connectorName,
                config: connector.config,
              },
            })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: createConnector.pending.type },
            {
              type: createConnector.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors`,
                message: undefined,
              },
            },
          ]);
        });
      });
      describe('deleteConnector', () => {
        it('creates deleteConnector/fulfilled', async () => {
          fetchMock.deleteOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
            {}
          );
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connectors?search=`,
            connectorsServerPayload
          );
          await store.dispatch(
            deleteConnector({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: deleteConnector.pending.type },
            { type: fetchConnectors.pending.type },
            {
              type: deleteConnector.fulfilled.type,
              payload: { connectorName },
            },
          ]);
        });
        it('creates deleteConnector/rejected', async () => {
          fetchMock.deleteOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
            404
          );
          try {
            await store.dispatch(
              deleteConnector({ clusterName, connectName, connectorName })
            );
          } catch {
            expect(getTypeAndPayload(store)).toEqual([
              { type: deleteConnector.pending.type },
              {
                type: deleteConnector.rejected.type,
                payload: {
                  alert: {
                    subject: 'local-first-hdfs-source-connector',
                    title: 'Kafka Connect Connector Delete',
                    response: {
                      status: 404,
                      statusText: 'Not Found',
                      url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}`,
                    },
                  },
                },
              },
            ]);
          }
        });
      });
      describe('fetchConnectorTasks', () => {
        it('creates fetchConnectorTasks/fulfilled when fetching connects', async () => {
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
            tasksServerPayload
          );
          await store.dispatch(
            fetchConnectorTasks({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnectorTasks.pending.type },
            {
              type: fetchConnectorTasks.fulfilled.type,
              payload: { tasks },
            },
          ]);
        });
        it('creates fetchConnectorTasks/rejected', async () => {
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
            404
          );
          await store.dispatch(
            fetchConnectorTasks({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnectorTasks.pending.type },
            {
              type: fetchConnectorTasks.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
                message: undefined,
              },
            },
          ]);
        });
      });
      describe('restartConnector', () => {
        it('creates restartConnector/fulfilled', async () => {
          fetchMock.postOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESTART}`,
            { message: 'success' }
          );
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
            tasksServerPayload
          );
          await store.dispatch(
            restartConnector({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: restartConnector.pending.type },
            { type: fetchConnectorTasks.pending.type },
            { type: restartConnector.fulfilled.type },
          ]);
        });
        it('creates restartConnector/rejected', async () => {
          fetchMock.postOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESTART}`,
            404
          );
          await store.dispatch(
            restartConnector({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: restartConnector.pending.type },
            {
              type: restartConnector.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESTART}`,
                message: undefined,
              },
            },
          ]);
        });
      });
      describe('pauseConnector', () => {
        it('creates pauseConnector/fulfilled when fetching connects', async () => {
          fetchMock.postOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.PAUSE}`,
            { message: 'success' }
          );
          await store.dispatch(
            pauseConnector({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: pauseConnector.pending.type },
            {
              type: setConnectorStatusState.type,
              payload: {
                connectorState: ConnectorState.PAUSED,
                taskState: ConnectorTaskStatus.PAUSED,
              },
            },
            { type: pauseConnector.fulfilled.type },
          ]);
        });
        it('creates pauseConnector/rejected', async () => {
          fetchMock.postOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.PAUSE}`,
            404
          );
          await store.dispatch(
            pauseConnector({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: pauseConnector.pending.type },
            {
              type: pauseConnector.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.PAUSE}`,
              },
            },
          ]);
        });
      });
      describe('resumeConnector', () => {
        it('creates resumeConnector/fulfilled when fetching connects', async () => {
          fetchMock.postOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESUME}`,
            { message: 'success' }
          );
          await store.dispatch(
            resumeConnector({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: resumeConnector.pending.type },
            {
              type: setConnectorStatusState.type,
              payload: {
                connectorState: ConnectorState.RUNNING,
                taskState: ConnectorTaskStatus.RUNNING,
              },
            },
            { type: resumeConnector.fulfilled.type },
          ]);
        });
        it('creates resumeConnector/rejected', async () => {
          fetchMock.postOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESUME}`,
            404
          );
          await store.dispatch(
            resumeConnector({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: resumeConnector.pending.type },
            {
              type: resumeConnector.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/action/${ConnectorAction.RESUME}`,
              },
            },
          ]);
        });
      });
      describe('restartConnectorTask', () => {
        it('creates restartConnectorTask/fulfilled when fetching connects', async () => {
          fetchMock.postOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks/${taskId}/action/restart`,
            { message: 'success' }
          );
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks`,
            tasksServerPayload
          );
          await store.dispatch(
            restartConnectorTask({
              clusterName,
              connectName,
              connectorName,
              taskId,
            })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: restartConnectorTask.pending.type },
            { type: fetchConnectorTasks.pending.type },
            { type: restartConnectorTask.fulfilled.type },
          ]);
        });
        it('creates restartConnectorTask/rejected', async () => {
          fetchMock.postOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks/${taskId}/action/restart`,
            404
          );
          await store.dispatch(
            restartConnectorTask({
              clusterName,
              connectName,
              connectorName,
              taskId,
            })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: restartConnectorTask.pending.type },
            {
              type: restartConnectorTask.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/tasks/${taskId}/action/restart`,
              },
            },
          ]);
        });
      });
      describe('fetchConnectorConfig', () => {
        it('creates fetchConnectorConfig/fulfilled when fetching connects', async () => {
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
            connector.config
          );
          await store.dispatch(
            fetchConnectorConfig({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnectorConfig.pending.type },
            {
              type: fetchConnectorConfig.fulfilled.type,
              payload: { config: connector.config },
            },
          ]);
        });
        it('creates fetchConnectorConfig/rejected', async () => {
          fetchMock.getOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
            404
          );
          await store.dispatch(
            fetchConnectorConfig({ clusterName, connectName, connectorName })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: fetchConnectorConfig.pending.type },
            {
              type: fetchConnectorConfig.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
                message: undefined,
              },
            },
          ]);
        });
      });
      describe('updateConnectorConfig', () => {
        it('creates updateConnectorConfig/fulfilled when fetching connects', async () => {
          fetchMock.putOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
            connectorServerPayload
          );
          await store.dispatch(
            updateConnectorConfig({
              clusterName,
              connectName,
              connectorName,
              connectorConfig: connector.config,
            })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: updateConnectorConfig.pending.type },
            {
              type: updateConnectorConfig.fulfilled.type,
              payload: { connector },
            },
          ]);
        });
        it('creates updateConnectorConfig/rejected', async () => {
          fetchMock.putOnce(
            `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
            404
          );
          await store.dispatch(
            updateConnectorConfig({
              clusterName,
              connectName,
              connectorName,
              connectorConfig: connector.config,
            })
          );
          expect(getTypeAndPayload(store)).toEqual([
            { type: updateConnectorConfig.pending.type },
            {
              type: updateConnectorConfig.rejected.type,
              payload: {
                status: 404,
                statusText: 'Not Found',
                url: `/api/clusters/${clusterName}/connects/${connectName}/connectors/${connectorName}/config`,
                message: undefined,
              },
            },
          ]);
        });
      });
    });
  });
});
