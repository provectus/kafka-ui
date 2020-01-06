import { FetchStatus } from "types";

export interface LoaderState {
  [key: string]: FetchStatus;
}
