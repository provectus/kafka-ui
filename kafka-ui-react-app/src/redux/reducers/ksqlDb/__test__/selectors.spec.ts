import { store } from 'redux/store';
import * as selectors from 'redux/reducers/ksqlDb/selectors';
import { fetchKsqlDbTables } from 'redux/reducers/ksqlDb/ksqlDbSlice';

import { fetchKsqlDbTablesPayload } from './fixtures';

describe('TopicMessages selectors', () => {
  describe('Initial state', () => {
    beforeAll(() => {
      store.dispatch({
        type: fetchKsqlDbTables.pending.type,
        payload: fetchKsqlDbTablesPayload,
      });
    });

    it('Returns empty state', () => {
      expect(selectors.getKsqlDbTables(store.getState())).toEqual({
        rows: [],
        fetched: false,
        fetching: true,
        tablesCount: 0,
        streamsCount: 0,
      });
    });
  });

  describe('State', () => {
    beforeAll(() => {
      store.dispatch({
        type: fetchKsqlDbTables.fulfilled.type,
        payload: fetchKsqlDbTablesPayload,
      });
    });

    it('Returns tables and streams', () => {
      expect(selectors.getKsqlDbTables(store.getState())).toEqual({
        rows: [
          ...fetchKsqlDbTablesPayload.streams,
          ...fetchKsqlDbTablesPayload.tables,
        ],
        fetched: true,
        fetching: false,
        tablesCount: 2,
        streamsCount: 2,
      });
    });
  });
});
