import { createSelector } from 'reselect';
import { RootState, SchemasState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';
import { SchemaSubject } from 'generated-sources';

const schemasState = ({ schemas }: RootState): SchemasState => schemas;

const getAllNames = (state: RootState) => schemasState(state).allNames;
const getSchemaMap = (state: RootState) => schemasState(state).byName;

const getSchemaListFetchingStatus = createFetchingSelector(
  'GET_CLUSTER_SCHEMAS'
);

const getSchemaVersionsFetchingStatus = createFetchingSelector(
  'GET_SCHEMA_VERSIONS'
);

export const getIsSchemaListFetched = createSelector(
  getSchemaListFetchingStatus,
  (status) => status === 'fetched'
);

export const getIsSchemaVersionFetched = createSelector(
  getSchemaVersionsFetchingStatus,
  (status) => status === 'fetched'
);

export const getSchemaList = createSelector(
  getIsSchemaListFetched,
  getAllNames,
  getSchemaMap,
  (isFetched, allNames, byName) => {
    if (!isFetched) {
      return [];
    }
    return allNames.map((subject) => byName[subject as string]);
  }
);

const getSchemaName = (_: RootState, subject: string) => subject;

export const getSchema = createSelector(
  getSchemaMap,
  getSchemaName,
  (schemas, subject) => schemas[subject]
);

export const getSchemaVersions = createSelector(
  schemasState,
  ({ currentSchemaVersions }) =>
    currentSchemaVersions.sort(
      (a: SchemaSubject, b: SchemaSubject) => a.id - b.id
    )
);
