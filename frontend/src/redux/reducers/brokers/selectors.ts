import { createSelector } from 'reselect';
import { RootState, FetchStatus, Broker } from 'types';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const brokersState = ({ brokers }: RootState): Broker[] => brokers;

const getBrokerListFetchingStatus = createFetchingSelector('GET_BROKERS');

export const getIsBrokerListFetched = createSelector(
  getBrokerListFetchingStatus,
  (status) => status === FetchStatus.fetched,
);

const getBrokerList = createSelector(brokersState, (brokers) => brokers);

export const getTotalBrokers = createSelector(
  getIsBrokerListFetched,
  getBrokerList,
  (isFetched, brokers) => (isFetched && brokers !== undefined ? brokers.length : undefined),
);
