import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert as AlertProps } from 'redux/interfaces';
import Alert from 'components/Alerts/Alert';
import { render } from 'lib/testHelpers';

const id = 'test-id';
const title = 'My Alert Title';
const message = 'My Alert Message';
const dismiss = jest.fn();

describe('Alert', () => {
  const setupComponent = (props: Partial<AlertProps> = {}) =>
    render(
      <Alert
        id={id}
        type="error"
        title={title}
        message={message}
        onDissmiss={dismiss}
        {...props}
      />
    );
  it('renders with initial props', () => {
    setupComponent();
    expect(screen.getByRole('heading')).toHaveTextContent(title);
    expect(screen.getByRole('contentinfo')).toHaveTextContent(message);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  it('handles dismiss callback', () => {
    setupComponent();
    userEvent.click(screen.getByRole('button'));
    expect(dismiss).toHaveBeenCalled();
  });
});
