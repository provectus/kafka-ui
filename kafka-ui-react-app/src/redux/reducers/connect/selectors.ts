import { createSelector } from '@reduxjs/toolkit';
import { ConnectState, RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { AsyncRequestStatus } from 'lib/constants';

import { fetchConnectorConfig } from './connectSlice';

const connectState = ({ connect }: RootState): ConnectState => connect;

const getCurrentConnector = createSelector(
  connectState,
  ({ currentConnector }) => currentConnector
);

const getConnectorConfigFetchingStatus = createFetchingSelector(
  fetchConnectorConfig.typePrefix
);
export const getIsConnectorConfigFetching = createSelector(
  getConnectorConfigFetchingStatus,
  (status) => status === AsyncRequestStatus.pending
);

export const getConnectorConfig = createSelector(
  getCurrentConnector,
  ({ config }) => config
);
