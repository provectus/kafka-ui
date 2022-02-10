import { Action, TopicsState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import * as _ from 'lodash';
import { SortOrder, TopicColumnsToSort } from 'generated-sources';

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
  totalPages: 1,
  search: '',
  orderBy: TopicColumnsToSort.NAME,
  sortOrder: SortOrder.ASC,
  consumerGroups: [],
};

// eslint-disable-next-line @typescript-eslint/default-param-last
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
        sortOrder:
          state.orderBy === action.payload && state.sortOrder === SortOrder.ASC
            ? SortOrder.DESC
            : SortOrder.ASC,
      };
    }
    case getType(actions.fetchTopicMessageSchemaAction.success): {
      const { topicName, schema } = action.payload;
      const newState = _.cloneDeep(state);
      newState.byName[topicName] = {
        ...newState.byName[topicName],
        messageSchema: schema,
      };
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
