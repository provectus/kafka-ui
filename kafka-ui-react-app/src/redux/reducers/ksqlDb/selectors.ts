import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { KsqlState } from 'redux/interfaces/ksqlDb';
import { AsyncRequestStatus } from 'lib/constants';

const ksqlDbState = ({ ksqlDb }: RootState): KsqlState => ksqlDb;

const getKsqlDbFetchTablesAndStreamsFetchingStatus = createFetchingSelector(
  'ksqlDb/fetchKsqlDbTables'
);

const getKsqlExecutionStatus = createFetchingSelector('ksqlDb/executeKsql');

export const getKsqlDbTables = createSelector(
  [ksqlDbState, getKsqlDbFetchTablesAndStreamsFetchingStatus],
  (state, status) => ({
    rows: { streams: [...state.streams], tables: [...state.tables] },
    fetched: status === AsyncRequestStatus.fulfilled,
    fetching: status === AsyncRequestStatus.pending,
    tablesCount: state.tables.length,
    streamsCount: state.streams.length,
  })
);

export const getKsqlExecution = createSelector(
  [ksqlDbState, getKsqlExecutionStatus],
  (state, status) => ({
    executionResult: state.executionResult,
    fetched: status === AsyncRequestStatus.fulfilled,
    fetching: status === AsyncRequestStatus.pending,
  })
);
