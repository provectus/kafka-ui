import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import ErrorPage from 'components/ErrorPage/ErrorPage';

describe('ErrorPage', () => {
  it('should check Error Page rendering with default text', () => {
    render(<ErrorPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page is not found')).toBeInTheDocument();
    expect(screen.getByText('Go Back to Dashboard')).toBeInTheDocument();
  });
  it('should check Error Page rendering with custom text', () => {
    const props = {
      status: 403,
      text: 'access is denied',
      btnText: 'Go back',
    };
    render(<ErrorPage {...props} />);
    expect(screen.getByText(props.status)).toBeInTheDocument();
    expect(screen.getByText(props.text)).toBeInTheDocument();
    expect(screen.getByText(props.btnText)).toBeInTheDocument();
  });
});
