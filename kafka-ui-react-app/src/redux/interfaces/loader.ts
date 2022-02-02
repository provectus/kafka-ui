export interface LoaderState {
  [key: string]: 'notFetched' | 'fetching' | 'fetched' | 'errorFetching';
}

export type AsyncRequestStatus =
  | 'initial'
  | 'pending'
  | 'fulfilled'
  | 'rejected';

export interface LoaderSliceState {
  [key: string]: AsyncRequestStatus;
}
