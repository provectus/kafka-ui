import { Action } from 'redux/interfaces';
import { Cluster } from 'generated-sources';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';

export const initialState: Cluster[] = [];

const reducer = (state = initialState, action: Action): Cluster[] => {
  switch (action.type) {
    case getType(actions.fetchClusterListAction.success):
      // eslint-disable-next-line no-param-reassign
      state = action.payload;
      return state;
    default:
      return state;
  }
};

export default reducer;
