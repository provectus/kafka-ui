import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import Alert, { AlertProps } from 'components/common/Alert/Alert';

const title = 'My Alert Title';
const message = 'My Alert Message';
const dismiss = jest.fn();

describe('Alert', () => {
  const setupComponent = (props: Partial<AlertProps> = {}) =>
    render(
      <Alert
        type="error"
        title={title}
        message={message}
        onDissmiss={dismiss}
        {...props}
      />
    );
  const getButton = () => screen.getByRole('button');
  it('renders with initial props', () => {
    setupComponent();
    expect(screen.getByRole('heading')).toHaveTextContent(title);
    expect(screen.getByRole('contentinfo')).toHaveTextContent(message);
    expect(getButton()).toBeInTheDocument();
  });
  it('handles dismiss callback', async () => {
    setupComponent();
    await userEvent.click(getButton());
    expect(dismiss).toHaveBeenCalled();
  });
});
