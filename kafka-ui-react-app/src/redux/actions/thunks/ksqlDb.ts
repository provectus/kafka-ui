import {
  Configuration,
  ExecuteKsqlRequest,
  KsqlApi,
  Table as KsqlTable,
} from 'generated-sources';
import {
  PromiseThunkResult,
  ClusterName,
  FailurePayload,
} from 'redux/interfaces';
import { BASE_PARAMS } from 'lib/constants';
import * as actions from 'redux/actions/actions';
import { getResponse } from 'lib/errorHandling';

const apiClientConf = new Configuration(BASE_PARAMS);
export const ksqlDbApiClient = new KsqlApi(apiClientConf);

export const transformKsqlResponse = (
  rawTable: Required<KsqlTable>
): Dictionary<string>[] =>
  rawTable.rows.map((row) =>
    row.reduce(
      (res, acc, index) => ({
        ...res,
        [rawTable.headers[index]]: acc,
      }),
      {} as Dictionary<string>
    )
  );

const getTables = (clusterName: ClusterName) =>
  ksqlDbApiClient.executeKsqlCommand({
    clusterName,
    ksqlCommand: { ksql: 'SHOW TABLES;' },
  });

const getStreams = (clusterName: ClusterName) =>
  ksqlDbApiClient.executeKsqlCommand({
    clusterName,
    ksqlCommand: { ksql: 'SHOW STREAMS;' },
  });

export const fetchKsqlDbTables =
  (clusterName: ClusterName): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.fetchKsqlDbTablesAction.request());
    try {
      const [tables, streams] = await Promise.all([
        getTables(clusterName),
        getStreams(clusterName),
      ]);

      dispatch(
        actions.fetchKsqlDbTablesAction.success({
          tables: tables.data ? transformKsqlResponse(tables.data) : [],
          streams: streams.data ? transformKsqlResponse(streams.data) : [],
        })
      );
    } catch (error) {
      const response = await getResponse(error as Response);
      const alert: FailurePayload = {
        subject: 'ksqlDb',
        title: `Failed to fetch tables and streams`,
        response,
      };

      dispatch(actions.fetchKsqlDbTablesAction.failure({ alert }));
    }
  };

export const executeKsql =
  (params: ExecuteKsqlRequest): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.executeKsqlAction.request());
    try {
      const response = await ksqlDbApiClient.executeKsql(params);

      dispatch(actions.executeKsqlAction.success(response));
    } catch (error) {
      const response = await getResponse(error as Response);
      const alert: FailurePayload = {
        subject: 'ksql execution',
        title: `Failed to execute command ${params.ksqlCommandV2?.ksql}`,
        response,
      };

      dispatch(actions.executeKsqlAction.failure({ alert }));
    }
  };
