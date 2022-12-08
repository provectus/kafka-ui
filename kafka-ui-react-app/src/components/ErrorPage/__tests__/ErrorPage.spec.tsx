import React from 'react';
import { render } from 'lib/testHelpers';
import ErrorPage from 'components/ErrorPage/ErrorPage';

describe('ErrorPage', () => {
  it('should check Error Page rendering with default text', () => {
    render(<ErrorPage />);
  });
  it('should check Error Page rendering with custom text', () => {});
});
