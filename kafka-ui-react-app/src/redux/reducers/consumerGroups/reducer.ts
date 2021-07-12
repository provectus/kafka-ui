import { Action, ConsumerGroupsState } from 'redux/interfaces';
import { ConsumerGroup } from 'generated-sources';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';

export const initialState: ConsumerGroupsState = {
  byID: {},
  allIDs: [],
};

const updateConsumerGroupsList = (
  state: ConsumerGroupsState,
  payload: ConsumerGroup[]
): ConsumerGroupsState => {
  const initialMemo: ConsumerGroupsState = {
    ...state,
    allIDs: [],
  };

  return payload.reduce(
    (memo: ConsumerGroupsState, consumerGroup) => ({
      ...memo,
      byID: {
        ...memo.byID,
        [consumerGroup.groupId]: {
          ...memo.byID[consumerGroup.groupId],
          ...consumerGroup,
        },
      },
      allIDs: [...memo.allIDs, consumerGroup.groupId],
    }),
    initialMemo
  );
};

const reducer = (state = initialState, action: Action): ConsumerGroupsState => {
  let newState;
  switch (action.type) {
    case getType(actions.fetchConsumerGroupsAction.success):
      return updateConsumerGroupsList(state, action.payload);
    case getType(actions.fetchConsumerGroupDetailsAction.success):
      return {
        ...state,
        byID: {
          ...state.byID,
          [action.payload.consumerGroupID]: {
            ...state.byID[action.payload.consumerGroupID],
            ...action.payload.details,
          },
        },
      };
    case getType(actions.deleteConsumerGroupAction.success):
      newState = { ...state };
      delete newState.byID[action.payload];
      newState.allIDs = newState.allIDs.filter((id) => id !== action.payload);
      return newState;
    default:
      return state;
  }
};

export default reducer;
