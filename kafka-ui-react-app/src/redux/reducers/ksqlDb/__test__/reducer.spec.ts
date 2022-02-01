import reducer, {
  initialState,
  fetchKsqlDbTables,
  resetExecutionResult,
} from 'redux/reducers/ksqlDb/ksqlDbSlice';

import { fetchKsqlDbTablesPayload } from './fixtures';

describe('KsqlDb reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, { type: fetchKsqlDbTables.pending })).toEqual(
      initialState
    );
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
