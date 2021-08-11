import { Action } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { KsqlState } from 'redux/interfaces/ksqlDb';

export const initialState: KsqlState = {
  streams: [],
  tables: [],
};

const reducer = (state = initialState, action: Action): KsqlState => {
  switch (action.type) {
    case getType(actions.fetchKsqlDbTablesAction.success):
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
