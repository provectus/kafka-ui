import React from 'react';
import Brokers from 'components/Brokers/Brokers';
import { render } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/dom';
import { Route } from 'react-router';
import { clusterBrokersPath } from 'lib/paths';
import fetchMock from 'fetch-mock';
import { clusterStatsPayload } from 'redux/reducers/brokers/__test__/fixtures';

describe('Brokers Component', () => {
  afterEach(() => fetchMock.reset());

  const clusterName = 'local';
  const renderComponent = () =>
    render(
      <Route path={clusterBrokersPath(':clusterName')}>
        <Brokers />
      </Route>,
      {
        pathname: clusterBrokersPath(clusterName),
      }
    );

  describe('Brokers', () => {
    it('renders', async () => {
      const mock = fetchMock.getOnce(
        `/api/clusters/${clusterName}/stats`,
        clusterStatsPayload
      );
      renderComponent();
      await waitFor(() => expect(mock.called()).toBeTruthy());
      expect(screen.getByRole('table')).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(3);
    });

    it('shows warning when offlinePartitionCount > 0', async () => {
      const mock = fetchMock.getOnce(`/api/clusters/${clusterName}/stats`, {
        ...clusterStatsPayload,
        offlinePartitionCount: 1345,
      });
      renderComponent();
      await waitFor(() => expect(mock.called()).toBeTruthy());
      const onlineWidget = screen.getByText(
        clusterStatsPayload.onlinePartitionCount
      );
      expect(onlineWidget).toBeInTheDocument();
      expect(onlineWidget).toHaveStyle({ color: '#E51A1A' });
    });
  });
});
