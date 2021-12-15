import React from 'react';
import { StaticRouter } from 'react-router';
import ClusterMenuItem, {
  ClusterMenuItemProps,
} from 'components/Nav/ClusterMenuItem';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('ClusterMenuItem', () => {
  const setupComponent = (
    props: Partial<ClusterMenuItemProps> = {},
    pathname?: string
  ) => (
    <StaticRouter location={{ pathname }} context={{}}>
      <ul>
        <ClusterMenuItem to="/test" {...props} />
      </ul>
    </StaticRouter>
  );

  it('renders component with correct title', () => {
    const testTitle = 'My Test Title';
    render(setupComponent({ title: testTitle }));
    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('renders top level component with correct styles', () => {
    render(setupComponent({ isTopLevel: true }));
    expect(screen.getByRole('menuitem')).toHaveStyle({ fontWeight: '500' });
  });

  it('renders non-top level component with correct styles', () => {
    render(setupComponent({ isTopLevel: false }));
    expect(screen.getByRole('menuitem')).toHaveStyle({ fontWeight: 'normal' });
  });

  it('renders list item with link inside', () => {
    render(setupComponent({ to: '/my-cluster' }));
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeInTheDocument();
  });

  it('renders list item without link inside', () => {
    render(setupComponent({ to: '' }));
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders list item with children', () => {
    render(
      <StaticRouter location={{}} context={{}}>
        <ul>
          <ClusterMenuItem to="/test">Test Text Box</ClusterMenuItem>
        </ul>
      </StaticRouter>
    );
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeInTheDocument();
    expect(screen.getByText('Test Text Box')).toBeInTheDocument();
  });
});
