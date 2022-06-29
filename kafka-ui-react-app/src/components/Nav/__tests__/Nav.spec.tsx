import React from 'react';
import Nav from 'components/Nav/Nav';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import {
  offlineClusterPayload,
  onlineClusterPayload,
} from 'components/Cluster/__tests__/fixtures';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import { Cluster } from 'generated-sources';

describe('Nav', () => {
  afterEach(() => fetchMock.restore());

  const renderComponent = async (payload: Cluster[] = []) => {
    const mock = fetchMock.get('/api/clusters', payload);
    await act(() => {
      render(<Nav />);
    });
    return waitFor(() => expect(mock.called()).toBeTruthy());
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
