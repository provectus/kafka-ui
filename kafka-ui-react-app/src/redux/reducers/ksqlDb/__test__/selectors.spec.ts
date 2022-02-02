import { store } from 'redux/store';
import * as selectors from 'redux/reducers/ksqlDb/selectors';
import { fetchKsqlDbTablesAction } from 'redux/actions';

import { fetchKsqlDbTablesPayload } from './fixtures';

describe('TopicMessages selectors', () => {
  describe('Initial state', () => {
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
      store.dispatch(fetchKsqlDbTablesAction.success(fetchKsqlDbTablesPayload));
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
