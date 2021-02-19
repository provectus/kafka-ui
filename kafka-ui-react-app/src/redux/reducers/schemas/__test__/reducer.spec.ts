import {
  fetchSchemasByClusterNameAction,
  fetchSchemaVersionsAction,
} from 'redux/actions';
import reducer from 'redux/reducers/schemas/reducer';
import {
  clusterSchemasPayload,
  initialState,
  schemaVersionsPayload,
} from './fixtures';

describe('Schemas reducer', () => {
  it('returns the initial state', () => {
    expect(
      reducer(undefined, fetchSchemasByClusterNameAction.request())
    ).toEqual(initialState);
    expect(reducer(undefined, fetchSchemaVersionsAction.request())).toEqual(
      initialState
    );
  });

  it('reacts on GET_CLUSTER_SCHEMAS__SUCCESS and returns payload', () => {
    expect(
      reducer(
        undefined,
        fetchSchemasByClusterNameAction.success(clusterSchemasPayload)
      )
    ).toMatchSnapshot();
  });

  it('reacts on GET_SCHEMA_VERSIONS__SUCCESS and returns payload', () => {
    expect(
      reducer(
        undefined,
        fetchSchemaVersionsAction.success(schemaVersionsPayload)
      )
    ).toMatchSnapshot();
  });
});
