import React from 'react';
import { StaticRouter } from 'react-router';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import ClusterMenuItem, {
  ClusterMenuItemProps,
} from 'components/Nav/ClusterMenuItem';
import { render, screen } from '@testing-library/react';

describe('ClusterMenuItem', () => {
  const setupComponent = (
    props: Partial<ClusterMenuItemProps> = {},
    pathname?: string
  ) => (
    <ThemeProvider theme={theme}>
      <StaticRouter location={{ pathname }} context={{}}>
        <ul>
          <ClusterMenuItem to="/test" {...props} />
        </ul>
      </StaticRouter>
    </ThemeProvider>
  );

  it('renders component with correct title', () => {
    const testTitle = 'My Test Title';
    render(setupComponent({ title: testTitle }));
    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('renders top level component with correct styles', () => {
    render(setupComponent({ isTopLevel: true }));
    expect(screen.getByRole('listitem')).toHaveStyle({ fontWeight: '500' });
  });

  it('renders non-top level component with correct styles', () => {
    render(setupComponent({ isTopLevel: false }));
    expect(screen.getByRole('listitem')).toHaveStyle({ fontWeight: 'normal' });
  });

  it('renders list item with link inside', () => {
    render(setupComponent({ to: '/my-cluster' }));
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeInTheDocument();
  });

  it('renders list item without link inside', () => {
    render(setupComponent({ to: '' }));
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders list item with children', () => {
    render(
      <ThemeProvider theme={theme}>
        <StaticRouter location={{}} context={{}}>
          <ul>
            <ClusterMenuItem to="/test">Test Text Box</ClusterMenuItem>
          </ul>
        </StaticRouter>
      </ThemeProvider>
    );
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeInTheDocument();
    expect(screen.getByText('Test Text Box')).toBeInTheDocument();
  });
});
