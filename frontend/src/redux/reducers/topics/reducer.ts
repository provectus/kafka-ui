import { Topic, Action } from 'types';
import actionType from 'redux/reducers/actionType';

export const initialState: Topic[] = [];

const reducer = (state = initialState, action: Action): Topic[] => {
  switch (action.type) {
    case actionType.GET_TOPICS__SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
