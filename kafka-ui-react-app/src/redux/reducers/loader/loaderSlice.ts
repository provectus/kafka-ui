import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  UnknownAsyncThunkFulfilledAction,
  UnknownAsyncThunkPendingAction,
  UnknownAsyncThunkRejectedAction,
} from '@reduxjs/toolkit/dist/matchers';
import { ClustersApi, Configuration } from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import { LoaderSliceState } from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
export const clustersApiClient = new ClustersApi(apiClientConf);

export const initialState: LoaderSliceState = {};

export const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    resetLoaderById: (
      state: LoaderSliceState,
      { payload }: PayloadAction<string>
    ) => {
      delete state[payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action): action is UnknownAsyncThunkPendingAction =>
          action.type.endsWith('/pending'),
        (state, { type }) => {
          state[type.replace('/pending', '')] = 'pending';
        }
      )
      .addMatcher(
        (action): action is UnknownAsyncThunkFulfilledAction =>
          action.type.endsWith('/fulfilled'),
        (state, { type }) => {
          state[type.replace('/fulfilled', '')] = 'fulfilled';
        }
      )
      .addMatcher(
        (action): action is UnknownAsyncThunkRejectedAction =>
          action.type.endsWith('/rejected'),
        (state, { type }) => {
          state[type.replace('/rejected', '')] = 'rejected';
        }
      );
  },
});

export const { resetLoaderById } = loaderSlice.actions;

export default loaderSlice.reducer;
