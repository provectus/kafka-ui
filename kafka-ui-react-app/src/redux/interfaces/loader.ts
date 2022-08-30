import { AsyncRequestStatus } from 'lib/constants';

export interface LoaderSliceState {
  [key: string]: AsyncRequestStatus;
}
