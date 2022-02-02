import { RootState } from 'redux/interfaces';

export const createLeagcyFetchingSelector =
  (action: string) => (state: RootState) =>
    state.legacyLoader[action] || 'notFetched';

export const createFetchingSelector = (action: string) => (state: RootState) =>
  state.loader[action] || 'initial';
