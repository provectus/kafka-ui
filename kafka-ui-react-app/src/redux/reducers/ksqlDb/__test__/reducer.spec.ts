import reducer, {
  initialState,
  fetchKsqlDbTables,
  resetExecutionResult,
  executeKsql,
  transformKsqlResponse,
} from 'redux/reducers/ksqlDb/ksqlDbSlice';
import { Table } from 'generated-sources';

import { fetchKsqlDbTablesPayload } from './fixtures';

describe('KsqlDb reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, { type: fetchKsqlDbTables.pending })).toEqual(
      initialState
    );
  });

  it('It should transform data with given headers and rows', () => {
    const data: Table = {
      headers: ['header1'],
      rows: [['value1'], ['value2'], ['value3']],
    };
    const transformedData = transformKsqlResponse(data);
    expect(transformedData).toEqual([
      { header1: 'value1' },
      { header1: 'value2' },
      { header1: 'value3' },
    ]);
  });

  it('Fetches tables and streams', () => {
    const state = reducer(undefined, {
      type: fetchKsqlDbTables.fulfilled,
      payload: fetchKsqlDbTablesPayload,
    });
    expect(state.tables.length).toEqual(2);
    expect(state.streams.length).toEqual(2);
    expect(state).toMatchSnapshot();
  });

  it('Exexute ksql and get result', () => {
    const state = reducer(undefined, {
      type: executeKsql.fulfilled,
      payload: fetchKsqlDbTablesPayload,
    });
    expect(state.executionResult).toBeTruthy();
    expect(state).toMatchSnapshot();
  });

  it('Resets execution result', () => {
    const state = reducer(
      {
        tables: [],
        streams: [],
        executionResult: {
          message: 'No available data',
        },
      },
      resetExecutionResult()
    );
    expect(state.executionResult).toEqual(null);
    expect(state).toMatchSnapshot();
  });
});
