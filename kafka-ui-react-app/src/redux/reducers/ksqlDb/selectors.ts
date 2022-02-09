import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { KsqlState } from 'redux/interfaces/ksqlDb';

const ksqlDbState = ({ ksqlDb }: RootState): KsqlState => ksqlDb;

const getKsqlDbFetchTablesAndStreamsFetchingStatus = createFetchingSelector(
  'ksqlDb/fetchKsqlDbTables'
);

const getKsqlExecutionStatus = createFetchingSelector('ksqlDb/executeKsql');

export const getKsqlDbTables = createSelector(
  [ksqlDbState, getKsqlDbFetchTablesAndStreamsFetchingStatus],
  (state, status) => ({
    rows: [...state.streams, ...state.tables],
    fetched: status === 'fulfilled',
    fetching: status === 'pending',
    tablesCount: state.tables.length,
    streamsCount: state.streams.length,
  })
);

export const getKsqlExecution = createSelector(
  [ksqlDbState, getKsqlExecutionStatus],
  (state, status) => ({
    executionResult: state.executionResult,
    fetched: status === 'fulfilled',
    fetching: status === 'pending',
  })
);
