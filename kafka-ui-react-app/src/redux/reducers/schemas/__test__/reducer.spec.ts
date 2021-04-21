import { SchemaSubject, SchemaType } from 'generated-sources';
import {
  createSchemaAction,
  deleteSchemaAction,
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
    expect(reducer(undefined, createSchemaAction.request())).toEqual(
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

  it('reacts on POST_SCHEMA__SUCCESS and returns payload', () => {
    expect(
      reducer(undefined, createSchemaAction.success(schemaVersionsPayload[0]))
    ).toMatchSnapshot();
  });

  it('deletes the schema from the list on DELETE_SCHEMA__SUCCESS', () => {
    const schema: SchemaSubject = {
      subject: 'name',
      version: '1',
      id: 1,
      schema: '{}',
      compatibilityLevel: 'BACKWARD',
      schemaType: SchemaType.AVRO,
    };
    expect(
      reducer(
        {
          byName: {
            [schema.subject]: schema,
          },
          allNames: [schema.subject],
          currentSchemaVersions: [],
        },
        deleteSchemaAction.success(schema.subject)
      )
    ).toEqual({
      byName: {},
      allNames: [],
      currentSchemaVersions: [],
    });
  });
});
