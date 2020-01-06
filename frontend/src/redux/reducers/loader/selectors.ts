import { RootState, FetchStatus } from 'types';

export const createFetchingSelector = (action: string) =>
  (state: RootState) => (state.loader[action] || FetchStatus.notFetched);
