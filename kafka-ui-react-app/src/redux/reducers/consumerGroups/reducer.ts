import { Action, ConsumerGroup } from 'redux/interfaces';
import { ActionType } from 'redux/actionType';
import { ConsumerGroupsState } from '../../interfaces/consumerGroup';

export const initialState: ConsumerGroupsState = {
  byID: {},
  allIDs: []
};

const updateConsumerGroupsList = (state: ConsumerGroupsState, payload: ConsumerGroup[]): ConsumerGroupsState => {
  const initialMemo: ConsumerGroupsState = {
    ...state,
    allIDs: []
  };

  return payload.reduce(
    (memo: ConsumerGroupsState, consumerGroup) => {
      const {consumerGroupId} = consumerGroup;
      memo.byID[consumerGroupId] = {
        ...memo.byID[consumerGroupId],
        ...consumerGroup,
      };
      memo.allIDs.push(consumerGroupId);

      return memo;
    },
    initialMemo,
  );
};

const reducer = (state = initialState, action: Action): ConsumerGroupsState => {
  switch (action.type) {
    case ActionType.GET_CONSUMER_GROUPS__SUCCESS:
      return updateConsumerGroupsList(state, action.payload);
    case ActionType.GET_CONSUMER_GROUP_DETAILS__SUCCESS:
      return {
        ...state,
        byID: {
          ...state.byID,
          [action.payload.consumerGroupID]: {
            ...state.byID[action.payload.consumerGroupID],
            ...action.payload.details,
          }
        }
      };
    default:
      return state;
  }
};

export default reducer;
