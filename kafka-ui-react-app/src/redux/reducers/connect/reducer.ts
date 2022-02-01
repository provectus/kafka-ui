import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { ConnectState } from 'redux/interfaces/connect';
import { Action } from 'redux/interfaces';
import { ConnectorState, ConnectorTaskStatus } from 'generated-sources';

export const initialState: ConnectState = {
  connects: [],
  connectors: [],
  currentConnector: {
    connector: null,
    tasks: [],
    config: null,
  },
  search: '',
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const reducer = (state = initialState, action: Action): ConnectState => {
  switch (action.type) {
    case getType(actions.fetchConnectsAction.success):
      return {
        ...state,
        connects: action.payload.connects,
      };
    case getType(actions.fetchConnectorsAction.success):
      return {
        ...state,
        connectors: action.payload.connectors,
      };
    case getType(actions.fetchConnectorAction.success):
    case getType(actions.createConnectorAction.success):
      return {
        ...state,
        currentConnector: {
          ...state.currentConnector,
          connector: action.payload.connector,
        },
      };
    case getType(actions.deleteConnectorAction.success):
      return {
        ...state,
        connectors: state?.connectors.filter(
          ({ name }) => name !== action.payload.connectorName
        ),
      };
    case getType(actions.pauseConnectorAction.success):
      return {
        ...state,
        currentConnector: {
          ...state.currentConnector,
          connector: state.currentConnector.connector
            ? {
                ...state.currentConnector.connector,
                status: {
                  ...state.currentConnector.connector?.status,
                  state: ConnectorState.PAUSED,
                },
              }
            : null,
          tasks: state.currentConnector.tasks.map((task) => ({
            ...task,
            status: {
              ...task.status,
              state: ConnectorTaskStatus.PAUSED,
            },
          })),
        },
      };
    case getType(actions.resumeConnectorAction.success):
      return {
        ...state,
        currentConnector: {
          ...state.currentConnector,
          connector: state.currentConnector.connector
            ? {
                ...state.currentConnector.connector,
                status: {
                  ...state.currentConnector.connector?.status,
                  state: ConnectorState.RUNNING,
                },
              }
            : null,
          tasks: state.currentConnector.tasks.map((task) => ({
            ...task,
            status: {
              ...task.status,
              state: ConnectorTaskStatus.RUNNING,
            },
          })),
        },
      };
    case getType(actions.fetchConnectorTasksAction.success):
      return {
        ...state,
        currentConnector: {
          ...state.currentConnector,
          tasks: action.payload.tasks,
        },
      };
    case getType(actions.fetchConnectorConfigAction.success):
      return {
        ...state,
        currentConnector: {
          ...state.currentConnector,
          config: action.payload.config,
        },
      };
    case getType(actions.updateConnectorConfigAction.success):
      return {
        ...state,
        currentConnector: {
          ...state.currentConnector,
          connector: action.payload.connector,
          config: action.payload.connector.config,
        },
      };
    default:
      return state;
  }
};

export default reducer;
