import { createSelector } from '@reduxjs/toolkit';
import { orderBy } from 'lodash';
import { RootState, SchemasState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const schemasState = ({ schemas }: RootState): SchemasState => schemas;

const getAllNames = (state: RootState) => schemasState(state).allNames;
const getSchemaMap = (state: RootState) => schemasState(state).byName;
export const getGlobalSchemaCompatibilityLevel = (state: RootState) =>
  schemasState(state).globalSchemaCompatibilityLevel;

const getSchemaListFetchingStatus = createFetchingSelector(
  'GET_CLUSTER_SCHEMAS'
);

const getSchemaVersionsFetchingStatus = createFetchingSelector(
  'GET_SCHEMA_VERSIONS'
);

const getSchemaCreationStatus = createFetchingSelector('POST_SCHEMA');

const getGlobalSchemaCompatibilityLevelFetchingStatus = createFetchingSelector(
  'GET_GLOBAL_SCHEMA_COMPATIBILITY'
);

export const getIsSchemaListFetched = createSelector(
  getSchemaListFetchingStatus,
  (status) => status === 'fetched'
);

export const getGlobalSchemaCompatibilityLevelFetched = createSelector(
  getGlobalSchemaCompatibilityLevelFetchingStatus,
  (status) => status === 'fetched'
);

export const getIsSchemaListFetching = createSelector(
  getSchemaListFetchingStatus,
  (status) => status === 'fetching' || status === 'notFetched'
);

export const getIsSchemaVersionFetched = createSelector(
  getSchemaVersionsFetchingStatus,
  (status) => status === 'fetched'
);

export const getSchemaCreated = createSelector(
  getSchemaCreationStatus,
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
    orderBy(currentSchemaVersions, ['id'], ['desc'])
);
