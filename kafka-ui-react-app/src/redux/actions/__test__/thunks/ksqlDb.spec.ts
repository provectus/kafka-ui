import fetchMock from 'fetch-mock-jest';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';
import * as thunks from 'redux/actions/thunks';
import * as actions from 'redux/actions';
import { ksqlCommandResponse } from 'redux/reducers/ksqlDb/__test__/fixtures';
import { transformKsqlResponse } from 'redux/actions/thunks';

const store = mockStoreCreator;
const clusterName = 'local';

describe('Thunks', () => {
  afterEach(() => {
    fetchMock.restore();
    store.clearActions();
  });

  describe('fetchKsqlDbTables', () => {
    it('creates GET_KSQL_DB_TABLES_AND_STREAMS__SUCCESS when fetching streams', async () => {
      fetchMock.post(`/api/clusters/${clusterName}/ksql`, ksqlCommandResponse);

      await store.dispatch(thunks.fetchKsqlDbTables(clusterName));

      expect(store.getActions()).toEqual([
        actions.fetchKsqlDbTablesAction.request(),
        actions.fetchKsqlDbTablesAction.success({
          streams: transformKsqlResponse(ksqlCommandResponse.data),
          tables: transformKsqlResponse(ksqlCommandResponse.data),
        }),
      ]);
    });

    it('creates GET_KSQL_DB_TABLES_AND_STREAMS__FAILURE', async () => {
      fetchMock.post(`/api/clusters/${clusterName}/ksql`, 422);

      await store.dispatch(thunks.fetchKsqlDbTables(clusterName));

      expect(store.getActions()).toEqual([
        actions.fetchKsqlDbTablesAction.request(),
        actions.fetchKsqlDbTablesAction.failure({
          alert: {
            subject: 'ksqlDb',
            title: 'Failed to fetch tables and streams',
            response: {
              status: 422,
              statusText: 'Unprocessable Entity',
              url: `/api/clusters/${clusterName}/ksql`,
            },
          },
        }),
      ]);
    });
  });
});
