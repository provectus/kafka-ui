import { Action } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { KsqlState } from 'redux/interfaces/ksqlDb';

export const initialState: KsqlState = {
  streams: [],
  tables: [],
  executionResult: null,
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const reducer = (state = initialState, action: Action): KsqlState => {
  switch (action.type) {
    case getType(actions.fetchKsqlDbTablesAction.success):
      return {
        ...state,
        ...action.payload,
      };
    case getType(actions.executeKsqlAction.success):
      return {
        ...state,
        executionResult: action.payload,
      };
    case getType(actions.resetExecutionResult):
      return {
        ...state,
        executionResult: null,
      };
    default:
      return state;
  }
};

export default reducer;
