import { RootState, FetchStatus } from 'redux/interfaces';

export const createFetchingSelector = (action: string) => (state: RootState) =>
  state.loader[action] || FetchStatus.notFetched;
