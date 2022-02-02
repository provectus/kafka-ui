import {
  Configuration,
  ExecuteKsqlCommandRequest,
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
      const tables = await getTables(clusterName);
      const streams = await getStreams(clusterName);

      dispatch(
        actions.fetchKsqlDbTablesAction.success({
          tables: tables.data ? transformKsqlResponse(tables.data) : [],
          streams: streams.data ? transformKsqlResponse(streams.data) : [],
        })
      );
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: 'ksqlDb',
        title: `Failed to fetch tables and streams`,
        response,
      };

      dispatch(actions.fetchKsqlDbTablesAction.failure({ alert }));
    }
  };

export const executeKsql =
  (params: ExecuteKsqlCommandRequest): PromiseThunkResult =>
  async (dispatch) => {
    dispatch(actions.executeKsqlAction.request());
    try {
      const response = await ksqlDbApiClient.executeKsqlCommand(params);

      dispatch(actions.executeKsqlAction.success(response));
    } catch (error) {
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: 'ksql execution',
        title: `Failed to execute command ${params.ksqlCommand?.ksql}`,
        response,
      };

      dispatch(actions.executeKsqlAction.failure({ alert }));
    }
  };
