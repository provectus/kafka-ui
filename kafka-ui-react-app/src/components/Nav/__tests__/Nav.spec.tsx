import React from 'react';
import Nav from 'components/Nav/Nav';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { act } from 'react-dom/test-utils';
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
  const renderComponent = async (payload: Cluster[] = []) => {
    (useClusters as jest.Mock).mockImplementation(() => ({
      data: payload,
      isSuccess: true,
    }));
    await act(() => {
      render(<Nav />);
    });
  };

  const getDashboard = () => screen.getByText('Dashboard');

  const getMenuItemsCount = () => screen.getAllByRole('menuitem').length;
  it('renders loader', async () => {
    await renderComponent();

    expect(getMenuItemsCount()).toEqual(1);
    expect(getDashboard()).toBeInTheDocument();
  });

  it('renders ClusterMenu', async () => {
    await renderComponent([onlineClusterPayload, offlineClusterPayload]);
    expect(screen.getAllByRole('menu').length).toEqual(3);
    expect(getMenuItemsCount()).toEqual(3);
    expect(getDashboard()).toBeInTheDocument();
    expect(screen.getByText(onlineClusterPayload.name)).toBeInTheDocument();
    expect(screen.getByText(offlineClusterPayload.name)).toBeInTheDocument();
  });
});
