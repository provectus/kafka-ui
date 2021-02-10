import ActionType from 'redux/actionType';
import { Action, Schema, SchemasState } from 'redux/interfaces';

export const initialState: SchemasState = {
  byName: {},
  allNames: [],
};

const updateSchemaList = (
  state: SchemasState,
  payload: Schema[]
): SchemasState => {
  const initialMemo: SchemasState = {
    ...state,
    allNames: [],
  };

  return payload.reduce(
    (memo: SchemasState, schema) => ({
      ...memo,
      byName: {
        ...memo.byName,
        [schema.name]: {
          ...memo.byName[schema.name],
          name: schema.name,
        },
      },
      allNames: [...memo.allNames, schema.name],
    }),
    initialMemo
  );
};

const reducer = (state = initialState, action: Action): SchemasState => {
  switch (action.type) {
    case ActionType.GET_CLUSTER_SCHEMAS__SUCCESS:
      return updateSchemaList(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
