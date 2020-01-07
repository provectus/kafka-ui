import { createSelector } from 'reselect';
import { RootState, FetchStatus, BrokersState } from 'types';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const brokersState = ({ brokers }: RootState): BrokersState => brokers;

const getBrokerListFetchingStatus = createFetchingSelector('GET_BROKERS');

export const getIsBrokerListFetched = createSelector(
  getBrokerListFetchingStatus,
  (status) => status === FetchStatus.fetched,
);

const getBrokerList = createSelector(brokersState, ({ items }) => items);

export const getTotalBrokers = createSelector(
  getIsBrokerListFetched,
  getBrokerList,
  (isFetched, brokers) => (isFetched && brokers !== undefined ? brokers.length : undefined),
);
