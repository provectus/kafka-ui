import { TopicMessage } from 'generated-sources';
import { Action, TopicsState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import * as _ from 'lodash';

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
  totalPages: 1,
  messages: [],
  search: '',
  orderBy: null,
  consumerGroups: [],
};

const transformTopicMessages = (
  state: TopicsState,
  messages: TopicMessage[]
): TopicsState => ({
  ...state,
  messages: messages.map((mes) => {
    const { content } = mes;
    let parsedContent = content;

    if (content) {
      try {
        parsedContent =
          typeof content !== 'object' ? JSON.parse(content) : content;
      } catch (err) {
        // do nothing
      }
    }

    return {
      ...mes,
      content: parsedContent,
    };
  }),
});

const reducer = (state = initialState, action: Action): TopicsState => {
  switch (action.type) {
    case getType(actions.fetchTopicsListAction.success):
    case getType(actions.fetchTopicDetailsAction.success):
    case getType(actions.fetchTopicConfigAction.success):
    case getType(actions.createTopicAction.success):
    case getType(actions.fetchTopicConsumerGroupsAction.success):
    case getType(actions.updateTopicAction.success):
      return action.payload;
    case getType(actions.fetchTopicMessagesAction.success):
      return transformTopicMessages(state, action.payload);
    case getType(actions.deleteTopicAction.success): {
      const newState: TopicsState = { ...state };
      delete newState.byName[action.payload];
      newState.allNames = newState.allNames.filter(
        (name) => name !== action.payload
      );
      return newState;
    }
    case getType(actions.clearMessagesTopicAction.success): {
      return {
        ...state,
        messages: [],
      };
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
