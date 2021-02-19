import { Action } from 'redux/interfaces';
import { Cluster } from 'generated-sources';

export const initialState: Cluster[] = [];

const reducer = (state = initialState, action: Action): Cluster[] => {
  switch (action.type) {
    case 'GET_CLUSTERS__SUCCESS':
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
