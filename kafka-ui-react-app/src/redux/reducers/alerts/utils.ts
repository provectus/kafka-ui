import { now, omit } from 'lodash';
import { Action, AlertsState, Alert } from 'redux/interfaces';

export const addError = (state: AlertsState, action: Action) => {
  if (
    'payload' in action &&
    typeof action.payload === 'object' &&
    'alert' in action.payload &&
    action.payload.alert !== undefined
  ) {
    const { subject, title, message, response } = action.payload.alert;

    const id = `${action.type}-${subject}`;

    return {
      ...state,
      [id]: {
        id,
        type: 'error',
        title,
        message,
        response,
        createdAt: now(),
      } as Alert,
    };
  }

  return { ...state };
};

export const removeAlert = (state: AlertsState, action: Action) => {
  if ('payload' in action && typeof action.payload === 'string') {
    return omit(state, action.payload);
  }

  return { ...state };
};
