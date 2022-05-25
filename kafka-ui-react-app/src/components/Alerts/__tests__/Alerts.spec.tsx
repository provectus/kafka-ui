import React from 'react';
import { ServerResponse } from 'redux/interfaces';
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

describe('Alerts', () => {
  it('renders alerts', async () => {
    store.dispatch(action);

    await act(() => {
      render(<Alerts />, { store });
    });

    expect(screen.getAllByRole('alert').length).toEqual(1);

    const dissmissAlertButtons = screen.getAllByRole('button');
    expect(dissmissAlertButtons.length).toEqual(1);

    const dissmissButton = dissmissAlertButtons[0];

    userEvent.click(dissmissButton);

    expect(screen.queryAllByRole('alert').length).toEqual(0);
  });
});
