import { createSelector } from '@reduxjs/toolkit';
import { ConnectState, RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import {
  ConnectorTaskStatus,
  ConnectorState,
  FullConnectorInfo,
} from 'generated-sources';
import { sortBy } from 'lodash';

import {
  deleteConnector,
  fetchConnector,
  fetchConnectorConfig,
  fetchConnectors,
  fetchConnectorTasks,
  fetchConnects,
  pauseConnector,
  restartConnector,
  resumeConnector,
} from './connectSlice';

const connectState = ({ connect }: RootState): ConnectState => connect;

const getConnectsFetchingStatus = createFetchingSelector(
  fetchConnects.typePrefix
);
export const getAreConnectsFetching = createSelector(
  getConnectsFetchingStatus,
  (status) => status === 'pending'
);

export const getConnects = createSelector(
  connectState,
  ({ connects }) => connects
);

const getConnectorsFetchingStatus = createFetchingSelector(
  fetchConnectors.typePrefix
);
export const getAreConnectorsFetching = createSelector(
  getConnectorsFetchingStatus,
  (status) => status === 'pending'
);

export const getConnectors = createSelector(
  connectState,
  ({ connectors }) => connectors
);

export const getFailedConnectors = createSelector(
  connectState,
  ({ connectors }) => {
    return connectors.filter(
      (connector: FullConnectorInfo) =>
        connector.status.state === ConnectorState.FAILED
    );
  }
);

export const getFailedTasks = createSelector(connectState, ({ connectors }) => {
  return connectors
    .map((connector: FullConnectorInfo) => connector.failedTasksCount || 0)
    .reduce((acc: number, value: number) => acc + value, 0);
});

export const getSortedTopics = createSelector(connectState, ({ connectors }) =>
  connectors.map(({ topics }) => sortBy(topics || []))
);

const getConnectorFetchingStatus = createFetchingSelector(
  fetchConnector.typePrefix
);
export const getIsConnectorFetching = createSelector(
  getConnectorFetchingStatus,
  (status) => status === 'pending'
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

const getConnectorDeletingStatus = createFetchingSelector(
  deleteConnector.typePrefix
);
export const getIsConnectorDeleting = createSelector(
  getConnectorDeletingStatus,
  (status) => status === 'pending'
);

const getConnectorRestartingStatus = createFetchingSelector(
  restartConnector.typePrefix
);
export const getIsConnectorRestarting = createSelector(
  getConnectorRestartingStatus,
  (status) => status === 'pending'
);

const getConnectorPausingStatus = createFetchingSelector(
  pauseConnector.typePrefix
);
export const getIsConnectorPausing = createSelector(
  getConnectorPausingStatus,
  (status) => status === 'pending'
);

const getConnectorResumingStatus = createFetchingSelector(
  resumeConnector.typePrefix
);
export const getIsConnectorResuming = createSelector(
  getConnectorResumingStatus,
  (status) => status === 'pending'
);

export const getIsConnectorActionRunning = createSelector(
  getIsConnectorRestarting,
  getIsConnectorPausing,
  getIsConnectorResuming,
  (restarting, pausing, resuming) => restarting || pausing || resuming
);

const getConnectorTasksFetchingStatus = createFetchingSelector(
  fetchConnectorTasks.typePrefix
);
export const getAreConnectorTasksFetching = createSelector(
  getConnectorTasksFetchingStatus,
  (status) => status === 'pending'
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
  fetchConnectorConfig.typePrefix
);
export const getIsConnectorConfigFetching = createSelector(
  getConnectorConfigFetchingStatus,
  (status) => status === 'pending'
);

export const getConnectorConfig = createSelector(
  getCurrentConnector,
  ({ config }) => config
);

export const getConnectorSearch = createSelector(
  connectState,
  (state) => state.search
);
