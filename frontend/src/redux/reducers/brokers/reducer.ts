import { Broker, Action } from 'types';
import actionType from 'redux/reducers/actionType';

export const initialState: Broker[] = [];

const reducer = (state = initialState, action: Action): Broker[] => {
  switch (action.type) {
    case actionType.GET_BROKERS__SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
