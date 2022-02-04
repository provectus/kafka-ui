import { getType } from 'typesafe-actions';
import { dismissAlert } from 'redux/actions';
import { Action, AlertsState } from 'redux/interfaces';

import { addError, removeAlert } from './utils';

export const initialState: AlertsState = {};

// eslint-disable-next-line @typescript-eslint/default-param-last
const reducer = (state = initialState, action: Action): AlertsState => {
  const { type } = action;

  if (type.endsWith('__FAILURE')) return addError(state, action);

  if (type === getType(dismissAlert)) {
    return removeAlert(state, action);
  }

  return state;
};

export default reducer;
