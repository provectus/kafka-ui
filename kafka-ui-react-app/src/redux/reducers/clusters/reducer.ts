import { v4 } from 'uuid';
import { Action, Cluster } from 'redux/interfaces';
import ActionType from 'redux/actionType';

export const initialState: Cluster[] = [];

const reducer = (state = initialState, action: Action): Cluster[] => {
  switch (action.type) {
    case ActionType.GET_CLUSTERS__SUCCESS:
      return action.payload.map((cluster) => ({ id: v4(), ...cluster }));
    default:
      return state;
  }
};

export default reducer;
