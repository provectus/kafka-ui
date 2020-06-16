import { Action, TopicsState, Topic } from 'redux/interfaces';
import ActionType from 'redux/actionType';

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

  return payload.reduce((memo: TopicsState, topic) => {
    const { name } = topic;
    memo.byName[name] = {
      ...memo.byName[name],
      ...topic,
    };
    memo.allNames.push(name);

    return memo;
  }, initialMemo);
};

const addToTopicList = (state: TopicsState, payload: Topic): TopicsState => {
  const newState: TopicsState = {
    ...state,
  };
  newState.allNames.push(payload.name);
  newState.byName[payload.name] = payload;
  return newState;
};

const reducer = (state = initialState, action: Action): TopicsState => {
  switch (action.type) {
    case ActionType.GET_TOPICS__SUCCESS:
      return updateTopicList(state, action.payload);
    case ActionType.GET_TOPIC_DETAILS__SUCCESS:
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
    case ActionType.GET_TOPIC_MESSAGES__SUCCESS:
      return {
        ...state,
        messages: action.payload,
      };
    case ActionType.GET_TOPIC_CONFIG__SUCCESS:
      return {
        ...state,
        byName: {
          ...state.byName,
          [action.payload.topicName]: {
            ...state.byName[action.payload.topicName],
            config: action.payload.config,
          },
        },
      };
    case ActionType.POST_TOPIC__SUCCESS:
      return addToTopicList(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
