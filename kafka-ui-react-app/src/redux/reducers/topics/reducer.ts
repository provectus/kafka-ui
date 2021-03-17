import { TopicMessage } from 'generated-sources';
import { Action, TopicsState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
  totalPages: 1,
  messages: [],
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
      } catch (_) {
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
    case getType(actions.updateTopicAction.success):
      return action.payload;
    case getType(actions.fetchTopicMessagesAction.success):
      return transformTopicMessages(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
