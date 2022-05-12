import React from 'react';
import { Action, FailurePayload, ServerResponse } from 'redux/interfaces';
import { act, screen } from '@testing-library/react';
import Alerts from 'components/Alerts/Alerts';
import { render } from 'lib/testHelpers';
import { store } from 'redux/store';
import { UnknownAsyncThunkRejectedWithValueAction } from '@reduxjs/toolkit/dist/matchers';
import userEvent from '@testing-library/user-event';

const payload: ServerResponse = {
  status: 422,
  statusText: 'Unprocessable Entity',
  message: 'Unprocessable Entity',
  url: 'https://test.com/clusters',
};
const action: UnknownAsyncThunkRejectedWithValueAction = {
  type: 'any/action/rejected',
  payload,
  meta: {
    arg: 'test',
    requestId: 'test-request-id',
    requestStatus: 'rejected',
    aborted: false,
    condition: false,
    rejectedWithValue: true,
  },
  error: { message: 'Rejected' },
};
const alert: FailurePayload = {
  title: '404 - Not Found',
  message: 'Item is not found',
  subject: 'subject',
};
const legacyAction: Action = {
  type: 'CLEAR_TOPIC_MESSAGES__FAILURE',
  payload: { alert },
};

describe('Alerts', () => {
  it('renders alerts', async () => {
    store.dispatch(action);
    store.dispatch(legacyAction);

    await act(() => {
      render(<Alerts />, { store });
    });

    expect(screen.getAllByRole('alert').length).toEqual(2);

    const dissmissAlertButtons = screen.getAllByRole('button');
    expect(dissmissAlertButtons.length).toEqual(2);

    const dissmissButton = dissmissAlertButtons[0];
    const dissmissLegacyButton = dissmissAlertButtons[1];

    userEvent.click(dissmissButton);
    userEvent.click(dissmissLegacyButton);

    expect(screen.queryAllByRole('alert').length).toEqual(0);
  });
});
