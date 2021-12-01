import React from 'react';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

describe('PageLoader', () => {
  it('renders spinner', () => {
    render(
      <ThemeProvider theme={theme}>
        <PageLoader />
      </ThemeProvider>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
