import { RootState } from 'redux/interfaces';
import { AsyncRequestStatus } from 'lib/constants';

export const createFetchingSelector = (action: string) => (state: RootState) =>
  state.loader[action] || AsyncRequestStatus.initial;
