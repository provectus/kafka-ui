import { Action, ConsumerGroup } from 'redux/interfaces';
import { ActionType } from 'redux/actionType';

export const initialState: ConsumerGroup[] = [];

const reducer = (state = initialState, action: Action): ConsumerGroup[] => {
  switch (action.type) {
    case ActionType.GET_CONSUMER_GROUPS__SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
