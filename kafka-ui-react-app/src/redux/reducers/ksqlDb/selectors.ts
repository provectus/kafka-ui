import { createSelector } from 'reselect';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { KsqlState } from 'redux/interfaces/ksqlDb';

const consumerGroupsState = ({ ksqlDb }: RootState): KsqlState => ksqlDb;

const getConsumerGroupsListFetchingStatus = createFetchingSelector(
  'GET_KSQL_DB_TABLES_AND_STREAMS'
);

export const getKsqlDbTables = createSelector(
  [consumerGroupsState, getConsumerGroupsListFetchingStatus],
  (state, status) => ({
    rows: [...state.streams, ...state.tables],
    fetched: status === 'fetched',
    fetching: status === 'fetching' || status === 'notFetched',
    tablesCount: state.tables.length,
    streamsCount: state.streams.length,
  })
);
