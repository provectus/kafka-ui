import { Configuration, KsqlApi, Table as KsqlTable } from 'generated-sources';
import { PromiseThunkResult, ClusterName } from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import * as actions from 'redux/actions/actions';

const apiClientConf = new Configuration(BASE_PARAMS);
export const brokersApiClient = new KsqlApi(apiClientConf);

const transformKsqlTablesResponse = (
  rawTable: Required<KsqlTable>
): Record<string, string>[] => {
  const { headers, rows } = rawTable;

  const tables = rows.map((row) => {
    const objectRow: Record<string, string> = {};
    row.forEach((_, index) => {
      objectRow[headers[index]] = row[index];
    });
    return objectRow;
  });

  return tables;
};

export const fetchKsqlDbTables =
  (clusterName: ClusterName): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.fetchKsqlDbTablesAction.request());
    try {
      const payload = await brokersApiClient.executeKsqlCommand({
        clusterName,
        ksqlCommand: { ksql: 'SHOW TABLES;' },
      });
      if (payload.data) {
        dispatch(
          actions.fetchKsqlDbTablesAction.success({
            headers: payload.data.headers,
            rows: transformKsqlTablesResponse(payload.data),
          })
        );
      }
    } catch (e) {
      dispatch(actions.fetchKsqlDbTablesAction.failure({}));
    }
  };
