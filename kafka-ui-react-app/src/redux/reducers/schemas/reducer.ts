import { SchemaSubject } from 'generated-sources';
import { Action, SchemasState } from 'redux/interfaces';
import * as actions from 'redux/actions';
import { getType } from 'typesafe-actions';

export const initialState: SchemasState = {
  byName: {},
  allNames: [],
  currentSchemaVersions: [],
};

const updateSchemaList = (
  state: SchemasState,
  payload: SchemaSubject[]
): SchemasState => {
  const initialMemo: SchemasState = {
    ...state,
    allNames: [],
  };

  return payload.reduce((memo: SchemasState, schema) => {
    if (!schema.subject) return memo;
    return {
      ...memo,
      byName: {
        ...memo.byName,
        [schema.subject]: {
          ...memo.byName[schema.subject],
          ...schema,
        },
      },
      allNames: [...memo.allNames, schema.subject],
    };
  }, initialMemo);
};

const addToSchemaList = (
  state: SchemasState,
  payload: SchemaSubject
): SchemasState => {
  const newState: SchemasState = {
    ...state,
  };
  newState.allNames.push(payload.subject);
  newState.byName[payload.subject] = { ...payload };
  return newState;
};

const deleteFromSchemaList = (
  state: SchemasState,
  payload: string
): SchemasState => {
  const newState: SchemasState = {
    ...state,
  };
  delete newState.byName[payload];
  newState.allNames = newState.allNames.filter((name) => name !== payload);
  return newState;
};

const reducer = (state = initialState, action: Action): SchemasState => {
  switch (action.type) {
    case 'GET_CLUSTER_SCHEMAS__SUCCESS':
      return updateSchemaList(state, action.payload);
    case 'GET_SCHEMA_VERSIONS__SUCCESS':
      return { ...state, currentSchemaVersions: action.payload };
    case 'POST_SCHEMA__SUCCESS':
      return addToSchemaList(state, action.payload);
    case 'PATCH_SCHEMA__SUCCESS':
      return addToSchemaList(state, action.payload);
    case getType(actions.deleteSchemaAction.success):
      return deleteFromSchemaList(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
