import { ClustersState, Action } from 'types';
import actionType from 'redux/reducers/actionType';

export const initialState: ClustersState = [];

const reducer = (state = initialState, action: Action): ClustersState => {
  switch (action.type) {
    case actionType.GET_CLUSTERS__SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
