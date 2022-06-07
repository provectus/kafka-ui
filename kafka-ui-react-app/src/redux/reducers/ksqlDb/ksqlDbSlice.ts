import { KsqlState } from 'redux/interfaces/ksqlDb';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_PARAMS } from 'lib/constants';
import {
  Configuration,
  ExecuteKsqlRequest,
  KsqlApi,
  Table as KsqlTable,
} from 'generated-sources';
import { ClusterName } from 'redux/interfaces';

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
  ksqlDbApiClient.listTables({
    clusterName,
  });

const getStreams = (clusterName: ClusterName) =>
  ksqlDbApiClient.listStreams({
    clusterName,
  });

export const fetchKsqlDbTables = createAsyncThunk(
  'ksqlDb/fetchKsqlDbTables',
  async (clusterName: ClusterName) => {
    const [tables, streams] = await Promise.all([
      getTables(clusterName),
      getStreams(clusterName),
    ]);

    const processedTables = tables.map((table) => ({
      type: 'TABLE',
      ...table,
    }));
    const processedStreams = streams.map((stream) => ({
      type: 'STREAM',
      ...stream,
    }));

    return {
      tables: processedTables,
      streams: processedStreams,
    };
  }
);

export const executeKsql = createAsyncThunk(
  'ksqlDb/executeKsql',
  (params: ExecuteKsqlRequest) => ksqlDbApiClient.executeKsql(params)
);

export const initialState: KsqlState = {
  streams: [],
  tables: [],
  executionResult: null,
};

export const ksqlDbSlice = createSlice({
  name: 'ksqlDb',
  initialState,
  reducers: {
    resetExecutionResult: (state) => ({
      ...state,
      executionResult: null,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(fetchKsqlDbTables.fulfilled, (state, action) => ({
      ...state,
      ...action.payload,
    }));
    builder.addCase(executeKsql.fulfilled, (state, action) => ({
      ...state,
      executionResult: action.payload,
    }));
  },
});

export const { resetExecutionResult } = ksqlDbSlice.actions;

export default ksqlDbSlice.reducer;
