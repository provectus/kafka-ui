import React from 'react';
import { render } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/dom';
import { Route } from 'react-router-dom';
import { clusterBrokerPath } from 'lib/paths';
import fetchMock from 'fetch-mock';
import {
  clusterStatsPayload,
  clusterStatsPayloadBroker,
} from 'redux/reducers/brokers/__test__/fixtures';
import { act } from '@testing-library/react';
import Broker from 'components/Brokers/Broker/Broker';

describe('Broker Component', () => {
  afterEach(() => fetchMock.reset());

  const clusterName = 'local';
  const brokerId = 1;

  const renderComponent = () =>
    render(
      <Route path={clusterBrokerPath(':clusterName', ':brokerId')}>
        <Broker />
      </Route>,
      {
        pathname: clusterBrokerPath(clusterName, brokerId),
      }
    );

  describe('Broker', () => {
    let fetchBrokersMock: fetchMock.FetchMockStatic;
    const fetchStatsUrl = `/api/clusters/${clusterName}/stats`;
    const fetchBrokerMockUrl = `/api/clusters/${clusterName}/brokers/logdirs?broker=${brokerId}`;

    beforeEach(() => {
      fetchBrokersMock = fetchMock.getOnce(
        `/api/clusters/${clusterName}/brokers/${brokerId}`,
        clusterStatsPayload
      );
    });

    it('renders', async () => {
      const fetchStatsMock = fetchMock.getOnce(
        fetchStatsUrl,
        clusterStatsPayload
      );
      const fetchBrokerMock = fetchMock.getOnce(
        `/api/clusters/${clusterName}/brokers/logdirs?broker=${brokerId}`,
        clusterStatsPayloadBroker
      );

      await act(() => {
        renderComponent();
      });

      await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokersMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokerMock.called()).toBeTruthy());

      expect(screen.getByRole('table')).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(2);
    });

    it('show warning when broker not found', async () => {
      const fetchStatsMock = fetchMock.getOnce(
        fetchStatsUrl,
        clusterStatsPayload
      );
      const fetchBrokerMock = fetchMock.getOnce(fetchBrokerMockUrl, []);
      await act(() => {
        renderComponent();
      });
      await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokersMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokerMock.called()).toBeTruthy());

      expect(
        screen.getByText('Log dir data not available')
      ).toBeInTheDocument();
    });
    it('show broker found', async () => {
      const fetchStatsMock = fetchMock.getOnce(
        fetchStatsUrl,
        clusterStatsPayload
      );
      const fetchBrokerMock = fetchMock.getOnce(
        fetchBrokerMockUrl,
        clusterStatsPayloadBroker
      );
      await act(() => {
        renderComponent();
      });
      await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokersMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokerMock.called()).toBeTruthy());

      const topicCount = screen.getByText(
        clusterStatsPayloadBroker[0].topics.length
      );
      const partitionsCount = screen.getByText(
        clusterStatsPayloadBroker[0].topics.reduce(
          (previousValue, currentValue) =>
            previousValue + (currentValue.partitions?.length || 0),
          0
        )
      );
      expect(topicCount).toBeInTheDocument();
      expect(partitionsCount).toBeInTheDocument();
    });
    it('show 0 when broker has not topics', async () => {
      const fetchStatsMock = fetchMock.getOnce(
        fetchStatsUrl,
        clusterStatsPayload
      );
      const fetchBrokerMock = fetchMock.getOnce(fetchBrokerMockUrl, [
        { ...clusterStatsPayloadBroker[0], topics: undefined },
      ]);
      await act(() => {
        renderComponent();
      });
      await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokersMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokerMock.called()).toBeTruthy());

      expect(screen.getAllByText(0).length).toEqual(2);
    });
    it('show - when broker has not name', async () => {
      const fetchStatsMock = fetchMock.getOnce(
        fetchStatsUrl,
        clusterStatsPayload
      );
      const fetchBrokerMock = fetchMock.getOnce(fetchBrokerMockUrl, [
        { ...clusterStatsPayloadBroker[0], name: undefined },
      ]);
      await act(() => {
        renderComponent();
      });
      await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokersMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokerMock.called()).toBeTruthy());

      expect(screen.getByText('-')).toBeInTheDocument();
    });
    it('show - when broker has not error', async () => {
      const fetchStatsMock = fetchMock.getOnce(
        fetchStatsUrl,
        clusterStatsPayload
      );
      const fetchBrokerMock = fetchMock.getOnce(fetchBrokerMockUrl, [
        { ...clusterStatsPayloadBroker[0], error: undefined },
      ]);
      await act(() => {
        renderComponent();
      });
      await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokersMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokerMock.called()).toBeTruthy());
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});
