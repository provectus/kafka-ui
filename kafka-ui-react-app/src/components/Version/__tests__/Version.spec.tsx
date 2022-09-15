import React from 'react';
import Version from 'components/Version/Version';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

const tag = 'v1.0.1-SHAPSHOT';
const commit = '123sdf34';

describe('Version', () => {
  const setupComponent = () => render(<Version />);

  it('renders', () => {
    setupComponent();
    expect(screen.getByText(tag)).toBeInTheDocument();
  });

  it('shows current tag and commit', () => {
    setupComponent();
    expect(screen.getByText(tag)).toBeInTheDocument();
    expect(screen.getByText(commit)).toBeInTheDocument();
  });
});
