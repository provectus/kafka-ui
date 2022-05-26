import { RootState } from 'redux/interfaces';

export const createFetchingSelector = (action: string) => (state: RootState) =>
  state.loader[action] || 'initial';
