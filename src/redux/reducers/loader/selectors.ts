import { RootState, FetchStatus } from 'lib/interfaces';

export const createFetchingSelector = (action: string) =>
  (state: RootState) => (state.loader[action] || FetchStatus.notFetched);
