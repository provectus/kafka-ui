import { createSelector } from 'reselect';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { KsqlState } from 'redux/interfaces/ksqlDb';

const consumerGroupsState = ({ ksqlDb }: RootState): KsqlState => ksqlDb;

const getConsumerGroupsListFetchingStatus =
  createFetchingSelector('GET_KSQL_DB_TABLES');

export const getKsqlDbTables = createSelector(
  [consumerGroupsState, getConsumerGroupsListFetchingStatus],
  (state, status) => ({
    rows: state.rows,
    headers: state.headers,
    fetched: status === 'fetched',
    fetching: status === 'fetching' || status === 'notFetched',
  })
);
