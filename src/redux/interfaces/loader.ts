import { FetchStatus } from 'redux/interfaces';

export interface LoaderState {
  [key: string]: FetchStatus;
}
