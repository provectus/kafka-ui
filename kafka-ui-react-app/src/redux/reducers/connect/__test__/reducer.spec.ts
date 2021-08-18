import { ConnectorState, ConnectorTaskStatus } from 'generated-sources';
import {
  fetchConnectorsAction,
  fetchConnectorAction,
  fetchConnectsAction,
  fetchConnectorTasksAction,
  fetchConnectorConfigAction,
  createConnectorAction,
  deleteConnectorAction,
  pauseConnectorAction,
  resumeConnectorAction,
  updateConnectorConfigAction,
} from 'redux/actions';
import reducer, { initialState } from 'redux/reducers/connect/reducer';

import { connects, connectors, connector, tasks } from './fixtures';

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

describe('Clusters reducer', () => {
  it('reacts on GET_CONNECTS__SUCCESS', () => {
    expect(
      reducer(initialState, fetchConnectsAction.success({ connects }))
    ).toEqual({
      ...initialState,
      connects,
    });
  });

  it('reacts on GET_CONNECTORS__SUCCESS', () => {
    expect(
      reducer(initialState, fetchConnectorsAction.success({ connectors }))
    ).toEqual({
      ...initialState,
      connectors,
    });
  });

  it('reacts on GET_CONNECTOR__SUCCESS', () => {
    expect(
      reducer(initialState, fetchConnectorAction.success({ connector }))
    ).toEqual({
      ...initialState,
      currentConnector: {
        ...initialState.currentConnector,
        connector,
      },
    });
  });

  it('reacts on POST_CONNECTOR__SUCCESS', () => {
    expect(
      reducer(initialState, createConnectorAction.success({ connector }))
    ).toEqual({
      ...initialState,
      currentConnector: {
        ...initialState.currentConnector,
        connector,
      },
    });
  });

  it('reacts on DELETE_CONNECTOR__SUCCESS', () => {
    expect(
      reducer(
        {
          ...initialState,
          connectors,
        },
        deleteConnectorAction.success({ connectorName: connectors[0].name })
      )
    ).toEqual({
      ...initialState,
      connectors: connectors.slice(1),
    });
  });

  it('reacts on PAUSE_CONNECTOR__SUCCESS', () => {
    expect(
      reducer(
        runningConnectorState,
        pauseConnectorAction.success({ connectorName: connector.name })
      )
    ).toEqual(pausedConnectorState);
  });

  it('reacts on PAUSE_CONNECTOR__SUCCESS when current connector is null', () => {
    expect(
      reducer(
        {
          ...initialState,
          currentConnector: {
            ...initialState.currentConnector,
            connector: null,
          },
        },
        pauseConnectorAction.success({ connectorName: connector.name })
      )
    ).toEqual({
      ...initialState,
      currentConnector: {
        ...initialState.currentConnector,
        connector: null,
      },
    });
  });

  it('reacts on RESUME_CONNECTOR__SUCCESS', () => {
    expect(
      reducer(
        pausedConnectorState,
        resumeConnectorAction.success({ connectorName: connector.name })
      )
    ).toEqual(runningConnectorState);
  });

  it('reacts on RESUME_CONNECTOR__SUCCESS when current connector is null', () => {
    expect(
      reducer(
        {
          ...initialState,
          currentConnector: {
            ...initialState.currentConnector,
            connector: null,
          },
        },
        resumeConnectorAction.success({ connectorName: connector.name })
      )
    ).toEqual({
      ...initialState,
      currentConnector: {
        ...initialState.currentConnector,
        connector: null,
      },
    });
  });

  it('reacts on GET_CONNECTOR_TASKS__SUCCESS', () => {
    expect(
      reducer(initialState, fetchConnectorTasksAction.success({ tasks }))
    ).toEqual({
      ...initialState,
      currentConnector: {
        ...initialState.currentConnector,
        tasks,
      },
    });
  });

  it('reacts on GET_CONNECTOR_CONFIG__SUCCESS', () => {
    expect(
      reducer(
        initialState,
        fetchConnectorConfigAction.success({ config: connector.config })
      )
    ).toEqual({
      ...initialState,
      currentConnector: {
        ...initialState.currentConnector,
        config: connector.config,
      },
    });
  });

  it('reacts on PATCH_CONNECTOR_CONFIG__SUCCESS', () => {
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
        updateConnectorConfigAction.success({ connector })
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
