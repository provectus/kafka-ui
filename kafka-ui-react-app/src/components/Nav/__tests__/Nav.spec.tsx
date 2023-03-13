import React from 'react';
import Nav from 'components/Nav/Nav';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { Cluster } from 'generated-sources';
import { useClusters } from 'lib/hooks/api/clusters';
import {
  offlineClusterPayload,
  onlineClusterPayload,
} from 'lib/fixtures/clusters';

jest.mock('lib/hooks/api/clusters', () => ({
  useClusters: jest.fn(),
}));

describe('Nav', () => {
  const renderComponent = (payload: Cluster[] = []) => {
    (useClusters as jest.Mock).mockImplementation(() => ({
      data: payload,
      isSuccess: true,
    }));
    render(<Nav />);
  };

  const getDashboard = () => screen.getByText('Dashboard');

  const getMenuItemsCount = () => screen.getAllByRole('menuitem').length;
  it('renders loader', () => {
    renderComponent();

    expect(getMenuItemsCount()).toEqual(1);
    expect(getDashboard()).toBeInTheDocument();
  });

  it('renders ClusterMenu', () => {
    renderComponent([onlineClusterPayload, offlineClusterPayload]);
    expect(screen.getAllByRole('menu').length).toEqual(3);
    expect(getMenuItemsCount()).toEqual(3);
    expect(getDashboard()).toBeInTheDocument();
    expect(screen.getByText(onlineClusterPayload.name)).toBeInTheDocument();
    expect(screen.getByText(offlineClusterPayload.name)).toBeInTheDocument();
  });
});
