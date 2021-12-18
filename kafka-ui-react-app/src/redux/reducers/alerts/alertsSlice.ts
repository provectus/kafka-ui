import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { UnknownAsyncThunkRejectedWithValueAction } from '@reduxjs/toolkit/dist/matchers';
import { now } from 'lodash';
import { Alert, RootState, ServerResponse } from 'redux/interfaces';

const alertsAdapter = createEntityAdapter<Alert>({
  selectId: (alert) => alert.id,
});

const isServerResponse = (payload: unknown): payload is ServerResponse => {
  if ((payload as ServerResponse).status) {
    return true;
  }
  return false;
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: alertsAdapter.getInitialState(),
  reducers: {
    alertDissmissed: alertsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is UnknownAsyncThunkRejectedWithValueAction =>
        action.type.endsWith('/rejected'),
      (state, { meta, payload }) => {
        const { rejectedWithValue } = meta;
        if (rejectedWithValue && isServerResponse(payload)) {
          const { status, statusText, message, url } = payload;
          const alert: Alert = {
            id: url || meta.requestId,
            type: 'error',
            title: `${status} ${statusText}`,
            message,
            response: payload,
            createdAt: now(),
          };
          alertsAdapter.addOne(state, alert);
        }
      }
    );
  },
});

export const { selectAll } = alertsAdapter.getSelectors<RootState>(
  (state) => state.alerts
);

export const { alertDissmissed } = alertsSlice.actions;

export default alertsSlice.reducer;
