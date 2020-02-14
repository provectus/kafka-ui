import { FetchStatus } from 'redux/interfaces/index';

export interface LoaderState {
  [key: string]: FetchStatus;
}
