import { FetchStatus, Action, LoaderState } from 'redux/interfaces';

export const initialState: LoaderState = {};

const reducer = (state = initialState, action: Action): LoaderState => {
  const { type } = action;
  const matches = /(.*)__(REQUEST|SUCCESS|FAILURE)$/.exec(type);

  // not a *__REQUEST / *__SUCCESS /  *__FAILURE actions, so we ignore them
  if (!matches) return state;

  const [, requestName, requestState] = matches;

  switch (requestState) {
    case 'REQUEST':
      return {
        ...state,
        [requestName]: FetchStatus.fetching,
      };
    case 'SUCCESS':
      return {
        ...state,
        [requestName]: FetchStatus.fetched,
      };
    case 'FAILURE':
      return {
        ...state,
        [requestName]: FetchStatus.errorFetching,
      };
    default:
      return state;
  }
};

export default reducer;
