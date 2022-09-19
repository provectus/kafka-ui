import React from 'react';
import Version from 'components/Version/Version';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('Version', () => {
  const setupComponent = () => render(<Version />);

  it('renders', () => {
    setupComponent();
    const element = screen.getByTestId('data_commit_wrapper');
    expect(element).toBeInTheDocument();
  });
});
