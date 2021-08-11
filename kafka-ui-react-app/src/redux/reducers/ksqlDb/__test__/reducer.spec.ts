import { fetchKsqlDbTablesAction } from 'redux/actions';
import reducer, { initialState } from 'redux/reducers/ksqlDb/reducer';

import { fetchKsqlDbTablesPayload } from './fixtures';

describe('TopicMessages reducer', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, fetchKsqlDbTablesAction.request())).toEqual(
      initialState
    );
  });
  it('Adds new message', () => {
    const state = reducer(
      undefined,
      fetchKsqlDbTablesAction.success(fetchKsqlDbTablesPayload)
    );
    expect(state.tables.length).toEqual(2);
    expect(state.streams.length).toEqual(2);
    expect(state).toMatchSnapshot();
  });
});
