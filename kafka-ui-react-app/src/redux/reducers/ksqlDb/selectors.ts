import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createLeagcyFetchingSelector } from 'redux/reducers/loader/selectors';
import { KsqlState } from 'redux/interfaces/ksqlDb';

const ksqlDbState = ({ ksqlDb }: RootState): KsqlState => ksqlDb;

const getKsqlDbFetchTablesAndStreamsFetchingStatus =
  createLeagcyFetchingSelector('GET_KSQL_DB_TABLES_AND_STREAMS');

const getKsqlExecutionStatus = createLeagcyFetchingSelector('EXECUTE_KSQL');

export const getKsqlDbTables = createSelector(
  [ksqlDbState, getKsqlDbFetchTablesAndStreamsFetchingStatus],
  (state, status) => ({
    rows: [...state.streams, ...state.tables],
    fetched: status === 'fetched',
    fetching: status === 'fetching' || status === 'notFetched',
    tablesCount: state.tables.length,
    streamsCount: state.streams.length,
  })
);

export const getKsqlExecution = createSelector(
  [ksqlDbState, getKsqlExecutionStatus],
  (state, status) => ({
    executionResult: state.executionResult,
    fetched: status === 'fetched',
    fetching: status === 'fetching',
  })
);
