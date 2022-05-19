import React from 'react';
import ClusterMenuItem, {
  ClusterMenuItemProps,
} from 'components/Nav/ClusterMenuItem';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('ClusterMenuItem', () => {
  const setupComponent = (props: Partial<ClusterMenuItemProps> = {}) => (
    <ul>
      <ClusterMenuItem to="/test" {...props} />
    </ul>
  );

  const getMenuItem = () => screen.getByRole('menuitem');
  const getLink = () => screen.queryByRole('link');

  it('renders component with correct title', () => {
    const testTitle = 'My Test Title';
    render(setupComponent({ title: testTitle }));
    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('renders top level component with correct styles', () => {
    render(setupComponent({ isTopLevel: true }));
    expect(getMenuItem()).toHaveStyle({ fontWeight: '500' });
  });

  it('renders non-top level component with correct styles', () => {
    render(setupComponent({ isTopLevel: false }));
    expect(getMenuItem()).toHaveStyle({ fontWeight: 'normal' });
  });

  it('renders list item with link inside', () => {
    render(setupComponent({ to: '/my-cluster' }));
    expect(getMenuItem()).toBeInTheDocument();
    expect(getLink()).toBeInTheDocument();
  });

  it('renders list item without link inside', () => {
    render(setupComponent({ to: '' }));
    expect(getMenuItem()).toBeInTheDocument();
    expect(getLink()).not.toBeInTheDocument();
  });

  it('renders list item with children', () => {
    render(
      <ul>
        <ClusterMenuItem to="/test">Test Text Box</ClusterMenuItem>
      </ul>
    );
    expect(getMenuItem()).toBeInTheDocument();
    expect(getLink()).toBeInTheDocument();
    expect(screen.getByText('Test Text Box')).toBeInTheDocument();
  });
});
