import { Action, Topic, TopicsState } from 'redux/interfaces';
import { ActionType } from 'redux/actionType';
import produce from 'immer';

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
};

type AddTopicCurried = (topic: Topic) => void;

function addTopic(draft: TopicsState): AddTopicCurried;
function addTopic(draft: TopicsState, topic: Topic): void;
function addTopic(draft: TopicsState, topic?: any) {
  const operation = (t: Topic) => {
    const { name } = t;
    draft.allNames.push(name);
    draft.byName[name] = t;
  };

  return topic ? operation(topic) : operation;
}

const reducer = produce((draft: TopicsState, action: Action) => {
  switch (action.type) {
    case ActionType.GET_TOPICS__SUCCESS:
      draft.allNames = [];

      action.payload.forEach(addTopic(draft));
      break;
    case ActionType.GET_TOPIC_DETAILS__SUCCESS:
      Object.assign(
        draft.byName[action.payload.topicName],
        action.payload.details
      );
      break;
    case ActionType.GET_TOPIC_CONFIG__SUCCESS:
      draft.byName[action.payload.topicName].config = action.payload.config;
      break;
    case ActionType.POST_TOPIC__SUCCESS:
      addTopic(draft, action.payload);
      break;
    case ActionType.PATCH_TOPIC__SUCCESS:
      Object.assign(draft.byName[action.payload.name], action.payload);
      break;
    default:
  }
}, initialState);

export default reducer;
