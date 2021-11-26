import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert as AlertProps } from 'redux/interfaces';
import * as actions from 'redux/actions/actions';
import Alert from 'components/Alert/Alert';

const id = 'test-id';
const title = 'My Alert Title';
const message = 'My Alert Message';
const statusCode = 123;
const serverSideMessage = 'Server Side Message';
const httpStatusText = 'My Status Text';
const dismiss = jest.fn();

describe('Alert', () => {
  const setupComponent = (props: Partial<AlertProps> = {}) =>
    render(
      <Alert
        id={id}
        type="error"
        title={title}
        message={message}
        createdAt={1234567}
        {...props}
      />
    );
  it('renders with initial props', () => {
    setupComponent();
    expect(screen.getByRole('heading')).toHaveTextContent(title);
    expect(screen.getByRole('contentinfo')).toHaveTextContent(message);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  it('renders alert with server side message', () => {
    setupComponent({
      type: 'info',
      response: {
        status: statusCode,
        statusText: 'My Status Text',
        body: {
          message: serverSideMessage,
        },
      },
    });
    expect(screen.getAllByRole('contentinfo').length).toEqual(2);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(
      screen.getByText(`${statusCode} ${serverSideMessage}`)
    ).toBeInTheDocument();
  });
  it('renders alert with http status text', () => {
    setupComponent({
      type: 'warning',
      response: {
        status: statusCode,
        statusText: httpStatusText,
        body: {},
      },
    });
    expect(screen.getAllByRole('contentinfo').length).toEqual(2);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(
      screen.getByText(`${statusCode} ${httpStatusText}`)
    ).toBeInTheDocument();
  });
  it('handles dismiss callback', () => {
    jest.spyOn(actions, 'dismissAlert').mockImplementation(dismiss);
    setupComponent();
    userEvent.click(screen.getByRole('button'));
    expect(dismiss).toHaveBeenCalledWith(id);
  });
});
