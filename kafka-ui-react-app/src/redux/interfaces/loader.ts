export interface LoaderState {
  [key: string]: 'notFetched' | 'fetching' | 'fetched' | 'errorFetching';
}
