import { Action, TopicMessagesState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';

export const initialState: TopicMessagesState = {
  messages: [],
  meta: {
    bytesConsumed: 0,
    elapsedMs: 0,
    messagesConsumed: 0,
    isCancelled: false,
  },
};

const reducer = (state = initialState, action: Action): TopicMessagesState => {
  switch (action.type) {
    case getType(actions.addTopicMessage): {
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    }
    case getType(actions.resetTopicMessages):
      return initialState;
    case getType(actions.updateTopicMessagesPhase):
      return {
        ...state,
        phase: action.payload,
      };
    case getType(actions.updateTopicMessagesMeta):
      return {
        ...state,
        meta: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
