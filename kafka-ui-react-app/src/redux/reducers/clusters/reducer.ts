import { Cluster, Action } from 'redux/interfaces';
import ActionType from 'redux/actionType';

export const initialState: Cluster[] = [];

const reducer = (state = initialState, action: Action): Cluster[] => {
  switch (action.type) {
    case ActionType.GET_CLUSTERS__SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
