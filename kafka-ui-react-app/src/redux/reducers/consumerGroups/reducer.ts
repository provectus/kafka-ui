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
        [consumerGroup.consumerGroupId]: {
          ...memo.byID[consumerGroup.consumerGroupId],
          ...consumerGroup,
        },
      },
      allIDs: [...memo.allIDs, consumerGroup.consumerGroupId],
    }),
    initialMemo
  );
};

const reducer = (state = initialState, action: Action): ConsumerGroupsState => {
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
    default:
      return state;
  }
};

export default reducer;
