import { v4 } from 'uuid';
import { Topic, TopicMessage } from 'generated-sources';
import { Action, TopicsState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
  messages: [],
};

const updateTopicList = (state: TopicsState, payload: Topic[]): TopicsState => {
  const initialMemo: TopicsState = {
    ...state,
    allNames: [],
  };

  return payload.reduce(
    (memo: TopicsState, topic) => ({
      ...memo,
      byName: {
        ...memo.byName,
        [topic.name]: {
          ...memo.byName[topic.name],
          ...topic,
          id: v4(),
        },
      },
      allNames: [...memo.allNames, topic.name],
    }),
    initialMemo
  );
};

const addToTopicList = (state: TopicsState, payload: Topic): TopicsState => {
  const newState: TopicsState = {
    ...state,
  };
  newState.allNames.push(payload.name);
  newState.byName[payload.name] = { ...payload, id: v4() };
  return newState;
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
      return updateTopicList(state, action.payload);
    case getType(actions.fetchTopicDetailsAction.success):
      return {
        ...state,
        byName: {
          ...state.byName,
          [action.payload.topicName]: {
            ...state.byName[action.payload.topicName],
            ...action.payload.details,
          },
        },
      };
    case getType(actions.fetchTopicMessagesAction.success):
      return transformTopicMessages(state, action.payload);
    case getType(actions.fetchTopicConfigAction.success):
      return {
        ...state,
        byName: {
          ...state.byName,
          [action.payload.topicName]: {
            ...state.byName[action.payload.topicName],
            config: action.payload.config.map((inputConfig) => ({
              ...inputConfig,
              id: v4(),
            })),
          },
        },
      };
    case getType(actions.createTopicAction.success):
      return addToTopicList(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
