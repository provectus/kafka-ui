import { createSelector } from 'reselect';
import { ConnectState, RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const connectState = ({ connect }: RootState): ConnectState => connect;

const getConnectorsFetchingStatus = createFetchingSelector('GET_CONNECTORS');
export const getAreConnectorsFetching = createSelector(
  getConnectorsFetchingStatus,
  (status) => status === 'fetching'
);
export const getAreConnectorsFetched = createSelector(
  getConnectorsFetchingStatus,
  (status) => status === 'fetched'
);

const getConnectsFetchingStatus = createFetchingSelector('GET_CONNECTS');
export const getAreConnectsFetching = createSelector(
  getConnectsFetchingStatus,
  (status) => status === 'fetching' || status === 'notFetched'
);
export const getAreConnectsFetched = createSelector(
  getConnectsFetchingStatus,
  (status) => status === 'fetched'
);

export const getConnects = createSelector(
  connectState,
  ({ connects }) => connects
);

export const getConnectors = createSelector(
  connectState,
  ({ connectors }) => connectors
);
