import React from 'react';
import Version, { VesionProps } from 'components/Version/Version';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

const tag = 'v1.0.1-SHAPSHOT';
const commit = '123sdf34';

describe('Version', () => {
  const setupComponent = (props: VesionProps) => render(<Version {...props} />);

  it('renders', () => {
    setupComponent({ tag });
    expect(screen.getByText('Version:')).toBeInTheDocument();
  });

  it('shows current tag and commit', () => {
    setupComponent({ tag, commit });
    expect(screen.getByText(tag)).toBeInTheDocument();
    expect(screen.getByText(commit)).toBeInTheDocument();
  });
});
