import { AsyncRequestStatus } from 'lib/constants';

export interface LoaderState {
  [key: string]: 'notFetched' | 'fetching' | 'fetched' | 'errorFetching';
}
export interface LoaderSliceState {
  [key: string]: AsyncRequestStatus;
}
