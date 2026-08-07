import React from 'react';
import Nav from 'components/Nav/Nav';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { Cluster } from 'generated-sources';
import { useClusters } from 'lib/hooks/api/clusters';
import { useGetUserInfo } from 'lib/hooks/api/roles';
import {
  offlineClusterPayload,
  onlineClusterPayload,
} from 'lib/fixtures/clusters';

jest.mock('lib/hooks/api/clusters', () => ({
  useClusters: jest.fn(),
}));

jest.mock('lib/hooks/api/roles', () => ({
  useGetUserInfo: jest.fn(),
}));

describe('Nav', () => {
  const renderComponent = (payload: Cluster[] = []) => {
    (useClusters as jest.Mock).mockImplementation(() => ({
      data: payload,
      isSuccess: true,
    }));
    (useGetUserInfo as jest.Mock).mockImplementation(() => ({
      data: { rbacEnabled: false },
    }));
    render(<Nav />);
  };

  const getDashboard = () => screen.getByText('Dashboard');

  const getMenuItemsCount = () => screen.getAllByRole('menuitem').length;
  it('renders loader', () => {
    renderComponent();

    expect(getMenuItemsCount()).toEqual(2);
    expect(getDashboard()).toBeInTheDocument();
  });

  it('renders ClusterMenu', () => {
    renderComponent([onlineClusterPayload, offlineClusterPayload]);
    expect(screen.getAllByRole('menu').length).toEqual(3);
    expect(getMenuItemsCount()).toEqual(4);
    expect(getDashboard()).toBeInTheDocument();
    expect(screen.getByText(onlineClusterPayload.name)).toBeInTheDocument();
    expect(screen.getByText(offlineClusterPayload.name)).toBeInTheDocument();
  });
});
