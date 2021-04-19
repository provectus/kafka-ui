import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { ConnectState } from 'redux/interfaces/connect';
import { Action } from 'redux/interfaces';

export const initialState: ConnectState = {
  connects: [],
  connectors: [],
};

const reducer = (state = initialState, action: Action): ConnectState => {
  switch (action.type) {
    case getType(actions.fetchConnectsAction.success):
    case getType(actions.fetchConnectorAction.success):
    case getType(actions.fetchConnectorsAction.success):
    case getType(actions.deleteConnectorAction.success):
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
