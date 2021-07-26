import { Action, TopicsState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
  totalPages: 1,
  search: '',
  orderBy: null,
  consumerGroups: [],
};

const reducer = (state = initialState, action: Action): TopicsState => {
  switch (action.type) {
    case getType(actions.fetchTopicsListAction.success):
    case getType(actions.fetchTopicDetailsAction.success):
    case getType(actions.fetchTopicConfigAction.success):
    case getType(actions.createTopicAction.success):
    case getType(actions.fetchTopicConsumerGroupsAction.success):
    case getType(actions.updateTopicAction.success):
      return action.payload;
    case getType(actions.deleteTopicAction.success): {
      const newState: TopicsState = { ...state };
      delete newState.byName[action.payload];
      newState.allNames = newState.allNames.filter(
        (name) => name !== action.payload
      );
      return newState;
    }
    case getType(actions.setTopicsSearchAction): {
      return {
        ...state,
        search: action.payload,
      };
    }
    case getType(actions.setTopicsOrderByAction): {
      return {
        ...state,
        orderBy: action.payload,
      };
    }
    default:
      return state;
  }
};

export default reducer;
