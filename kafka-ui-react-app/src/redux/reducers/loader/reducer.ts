import { Action, LoaderState } from 'redux/interfaces';

export const initialState: LoaderState = {};

const reducer = (state = initialState, action: Action): LoaderState => {
  const { type } = action;
  const splitType = type.split('__');
  const requestState = splitType.pop();
  const requestName = splitType.join('__');

  // not a *__REQUEST / *__SUCCESS /  *__FAILURE /  *__CANCEL actions, so we ignore them
  if (
    requestState &&
    !['REQUEST', 'SUCCESS', 'FAILURE', 'CANCEL'].includes(requestState)
  ) {
    return state;
  }

  switch (requestState) {
    case 'REQUEST':
      return {
        ...state,
        [requestName]: 'fetching',
      };
    case 'SUCCESS':
      return {
        ...state,
        [requestName]: 'fetched',
      };
    case 'FAILURE':
      return {
        ...state,
        [requestName]: 'errorFetching',
      };
    case 'CANCEL':
      return {
        ...state,
        [requestName]: 'notFetched',
      };
    default:
      return state;
  }
};

export default reducer;
