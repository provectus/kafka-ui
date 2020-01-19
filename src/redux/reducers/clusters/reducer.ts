import { Cluster, Action } from 'lib/interfaces';
import actionType from 'redux/reducers/actionType';

export const initialState: Cluster[] = [];

const reducer = (state = initialState, action: Action): Cluster[] => {
  switch (action.type) {
    case actionType.GET_CLUSTERS__SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
