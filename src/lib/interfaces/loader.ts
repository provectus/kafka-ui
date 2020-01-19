import { FetchStatus } from 'lib/interfaces';

export interface LoaderState {
  [key: string]: FetchStatus;
}
