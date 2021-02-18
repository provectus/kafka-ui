import { SchemaSubject } from 'generated-sources';
import { Action, SchemasState } from 'redux/interfaces';

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

const reducer = (state = initialState, action: Action): SchemasState => {
  switch (action.type) {
    case 'GET_CLUSTER_SCHEMAS__SUCCESS':
      return updateSchemaList(state, action.payload);
    case 'GET_SCHEMA_VERSIONS__SUCCESS':
      return { ...state, currentSchemaVersions: action.payload };
    default:
      return state;
  }
};

export default reducer;
