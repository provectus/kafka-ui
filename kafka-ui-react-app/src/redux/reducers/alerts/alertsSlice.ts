import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  nanoid,
  PayloadAction,
} from '@reduxjs/toolkit';
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

const transformResponseToAlert = (payload: ServerResponse) => {
  const { status, statusText, message, url } = payload;
  const alert: Alert = {
    id: url || nanoid(),
    type: 'error',
    title: `${status} ${statusText}`,
    message,
    response: payload,
    createdAt: now(),
  };

  return alert;
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: alertsAdapter.getInitialState(),
  reducers: {
    alertDissmissed: alertsAdapter.removeOne,
    alertAdded(state, action: PayloadAction<Alert>) {
      alertsAdapter.upsertOne(state, action.payload);
    },
    serverErrorAlertAdded: (
      state,
      { payload }: PayloadAction<ServerResponse>
    ) => {
      alertsAdapter.upsertOne(state, transformResponseToAlert(payload));
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action): action is UnknownAsyncThunkRejectedWithValueAction =>
        action.type.endsWith('/rejected'),
      (state, { meta, payload }) => {
        const { rejectedWithValue } = meta;
        if (rejectedWithValue && isServerResponse(payload)) {
          alertsAdapter.upsertOne(state, transformResponseToAlert(payload));
        }
      }
    );
  },
});

export const { selectAll } = alertsAdapter.getSelectors<RootState>(
  (state) => state.alerts
);

export const { alertDissmissed, alertAdded, serverErrorAlertAdded } =
  alertsSlice.actions;

export const showSuccessAlert = createAsyncThunk<
  number,
  { id: string; message: string },
  { fulfilledMeta: null }
>(
  'alerts/showSuccessAlert',
  async ({ id, message }, { dispatch, fulfillWithValue }) => {
    const creationDate = Date.now();

    dispatch(
      alertAdded({
        id,
        message,
        title: '',
        type: 'success',
        createdAt: creationDate,
      })
    );

    setTimeout(() => {
      dispatch(alertDissmissed(id));
    }, 3000);

    return fulfillWithValue(creationDate, null);
  }
);

export default alertsSlice.reducer;
