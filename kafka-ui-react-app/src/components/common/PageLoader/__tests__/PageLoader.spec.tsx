import React from 'react';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('PageLoader', () => {
  it('renders spinner', () => {
    render(<PageLoader />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
