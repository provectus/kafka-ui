import { Action, TopicsState, Topic } from 'lib/interfaces';
import actionType from 'redux/reducers/actionType';

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
};

const updateTopicList = (state: TopicsState, payload: Topic[]) => {
  const initialMemo: TopicsState = {
    ...state,
    allNames: [],
  }

  return payload.reduce(
    (memo: TopicsState, topic) => {
      const { name } = topic;
      memo.byName[name] = {
        ...memo.byName[name],
        ...topic,
      };
      memo.allNames.push(name);

      return memo;
    },
    initialMemo,
  );
}

const reducer = (state = initialState, action: Action): TopicsState => {
  switch (action.type) {
    case actionType.GET_TOPICS__SUCCESS:
      return updateTopicList(state, action.payload);
    case actionType.GET_TOPIC_DETAILS__SUCCESS:
      return {
        ...state,
        byName: {
          ...state.byName,
          [action.payload.topicName]: {
            ...state.byName[action.payload.topicName],
            ...action.payload.details,
          }
        }
      }
    case actionType.GET_TOPIC_CONFIG__SUCCESS:
      return {
        ...state,
        byName: {
          ...state.byName,
          [action.payload.topicName]: {
            ...state.byName[action.payload.topicName],
            config: action.payload.config,
          }
        }
      }
    default:
      return state;
  }
};

export default reducer;
