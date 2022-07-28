import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  UnknownAsyncThunkFulfilledAction,
  UnknownAsyncThunkPendingAction,
  UnknownAsyncThunkRejectedAction,
} from '@reduxjs/toolkit/dist/matchers';
import { AsyncRequestStatus } from 'lib/constants';
import { LoaderSliceState } from 'redux/interfaces';

const initialState: LoaderSliceState = {};

const loaderSlice = createSlice({
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
          state[type.replace('/pending', '')] = AsyncRequestStatus.pending;
        }
      )
      .addMatcher(
        (action): action is UnknownAsyncThunkFulfilledAction =>
          action.type.endsWith('/fulfilled'),
        (state, { type }) => {
          state[type.replace('/fulfilled', '')] = AsyncRequestStatus.fulfilled;
        }
      )
      .addMatcher(
        (action): action is UnknownAsyncThunkRejectedAction =>
          action.type.endsWith('/rejected'),
        (state, { type }) => {
          state[type.replace('/rejected', '')] = AsyncRequestStatus.rejected;
        }
      );
  },
});

export const { resetLoaderById } = loaderSlice.actions;

export default loaderSlice.reducer;
