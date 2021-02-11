import { createSelector } from 'reselect';
import {
  FetchStatus,
  RootState,
  SchemasState,
  TopicName,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/reducers/loader/selectors';

const schemasState = ({ schemas }: RootState): SchemasState => schemas;

const getAllNames = (state: RootState) => schemasState(state).allNames;
const getSchemaMap = (state: RootState) => schemasState(state).byName;

const getSchemaListFetchingStatus = createFetchingSelector(
  'GET_CLUSTER_SCHEMAS'
);

export const getIsSchemaListFetched = createSelector(
  getSchemaListFetchingStatus,
  (status) => status === FetchStatus.fetched
);

export const getSchemaList = createSelector(
  getIsSchemaListFetched,
  getAllNames,
  getSchemaMap,
  (isFetched, allNames, byName) => {
    if (!isFetched) {
      return [];
    }
    return allNames.map((subject) => byName[subject]);
  }
);

const getSchemaName = (_: RootState, subject: string) => subject;

export const getSchema = createSelector(
  getSchemaMap,
  getSchemaName,
  (schemas, subject) => schemas[subject]
);
