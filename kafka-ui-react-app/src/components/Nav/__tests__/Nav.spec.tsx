import React from 'react';
import {
  offlineClusterPayload,
  onlineClusterPayload,
} from 'redux/reducers/clusters/__test__/fixtures';
import Nav from 'components/Nav/Nav';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('Nav', () => {
  const getMenuItemsCount = () => screen.getAllByRole('menuitem').length;
  it('renders loader', () => {
    render(<Nav clusters={[]} />);
    expect(getMenuItemsCount()).toEqual(1);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders ClusterMenu', () => {
    render(
      <Nav
        clusters={[onlineClusterPayload, offlineClusterPayload]}
        areClustersFulfilled
      />
    );
    expect(screen.getAllByRole('menu').length).toEqual(3);
    expect(getMenuItemsCount()).toEqual(3);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(onlineClusterPayload.name)).toBeInTheDocument();
    expect(screen.getByText(offlineClusterPayload.name)).toBeInTheDocument();
  });
});
