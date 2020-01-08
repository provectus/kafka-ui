import { Action, TopicsState } from 'types';
import actionType from 'redux/reducers/actionType';

export const initialState: TopicsState = {
  byName: {},
  allNames: [],
};

const reducer = (state = initialState, action: Action): TopicsState => {
  switch (action.type) {
    case actionType.GET_TOPICS__SUCCESS:
      return action.payload.reduce(
        (memo, topic) => {
          const { name } = topic;
          memo.byName[name] = topic;
          memo.allNames.push(name);

          return memo;
        },
        initialState,
      );
    default:
      return state;
  }
};

export default reducer;
