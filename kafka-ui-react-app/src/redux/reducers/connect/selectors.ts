import { createSelector } from '@reduxjs/toolkit';
import { ConnectState, RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { ConnectorTaskStatus } from 'generated-sources';

const connectState = ({ connect }: RootState): ConnectState => connect;

const getConnectsFetchingStatus = createFetchingSelector('GET_CONNECTS');
export const getAreConnectsFetching = createSelector(
  getConnectsFetchingStatus,
  (status) => status === 'fetching'
);

export const getConnects = createSelector(
  connectState,
  ({ connects }) => connects
);

const getConnectorsFetchingStatus = createFetchingSelector('GET_CONNECTORS');
export const getAreConnectorsFetching = createSelector(
  getConnectorsFetchingStatus,
  (status) => status === 'fetching'
);

export const getConnectors = createSelector(
  connectState,
  ({ connectors }) => connectors
);

const getConnectorFetchingStatus = createFetchingSelector('GET_CONNECTOR');
export const getIsConnectorFetching = createSelector(
  getConnectorFetchingStatus,
  (status) => status === 'fetching'
);

const getCurrentConnector = createSelector(
  connectState,
  ({ currentConnector }) => currentConnector
);

export const getConnector = createSelector(
  getCurrentConnector,
  ({ connector }) => connector
);

export const getConnectorStatus = createSelector(
  getConnector,
  (connector) => connector?.status?.state
);

const getConnectorDeletingStatus = createFetchingSelector('DELETE_CONNECTOR');
export const getIsConnectorDeleting = createSelector(
  getConnectorDeletingStatus,
  (status) => status === 'fetching'
);

const getConnectorRestartingStatus =
  createFetchingSelector('RESTART_CONNECTOR');
export const getIsConnectorRestarting = createSelector(
  getConnectorRestartingStatus,
  (status) => status === 'fetching'
);

const getConnectorPausingStatus = createFetchingSelector('PAUSE_CONNECTOR');
export const getIsConnectorPausing = createSelector(
  getConnectorPausingStatus,
  (status) => status === 'fetching'
);

const getConnectorResumingStatus = createFetchingSelector('RESUME_CONNECTOR');
export const getIsConnectorResuming = createSelector(
  getConnectorResumingStatus,
  (status) => status === 'fetching'
);

export const getIsConnectorActionRunning = createSelector(
  getIsConnectorRestarting,
  getIsConnectorPausing,
  getIsConnectorResuming,
  (restarting, pausing, resuming) => restarting || pausing || resuming
);

const getConnectorTasksFetchingStatus = createFetchingSelector(
  'GET_CONNECTOR_TASKS'
);
export const getAreConnectorTasksFetching = createSelector(
  getConnectorTasksFetchingStatus,
  (status) => status === 'fetching'
);

export const getConnectorTasks = createSelector(
  getCurrentConnector,
  ({ tasks }) => tasks
);

export const getConnectorRunningTasksCount = createSelector(
  getConnectorTasks,
  (tasks) =>
    tasks.filter((task) => task.status?.state === ConnectorTaskStatus.RUNNING)
      .length
);

export const getConnectorFailedTasksCount = createSelector(
  getConnectorTasks,
  (tasks) =>
    tasks.filter((task) => task.status?.state === ConnectorTaskStatus.FAILED)
      .length
);

const getConnectorConfigFetchingStatus = createFetchingSelector(
  'GET_CONNECTOR_CONFIG'
);
export const getIsConnectorConfigFetching = createSelector(
  getConnectorConfigFetchingStatus,
  (status) => status === 'fetching'
);

export const getConnectorConfig = createSelector(
  getCurrentConnector,
  ({ config }) => config
);

export const getConnectorSearch = createSelector(
  connectState,
  (state) => state.search
);
