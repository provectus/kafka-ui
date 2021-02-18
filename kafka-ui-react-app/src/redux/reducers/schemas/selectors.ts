import { createSelector } from 'reselect';
import { RootState, SchemasState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

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
  (isFetched, allNames, byName) =>
    isFetched ? allNames.map((subject) => byName[subject]) : []
);

const getSchemaName = (_: RootState, subject: string) => subject;

export const getSchema = createSelector(
  getSchemaMap,
  getSchemaName,
  (schemas, subject) => schemas[subject]
);

export const getSortedSchemaVersions = createSelector(
  schemasState,
  ({ currentSchemaVersions }) =>
    currentSchemaVersions.sort((a, b) => a.id - b.id)
);
