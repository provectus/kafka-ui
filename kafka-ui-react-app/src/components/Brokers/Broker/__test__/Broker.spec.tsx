import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/dom';
import { clusterBrokerPath } from 'lib/paths';
import fetchMock from 'fetch-mock';
import { act } from '@testing-library/react';
import Broker from 'components/Brokers/Broker/Broker';
import {
  clusterStatsPayload,
  brokerLogDirsPayload,
  brokersPayload,
} from 'components/Brokers/__test__/fixtures';

const clusterName = 'local';
const brokerId = 1;
const fetchStatsUrl = `/api/clusters/${clusterName}/stats`;
const fetchBrokersUrl = `/api/clusters/${clusterName}/brokers`;
const fetchLogDirsUrl = `/api/clusters/${clusterName}/brokers/logdirs`;

describe('Broker Component', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  const renderComponent = async () => {
    const fetchStatsMock = fetchMock.get(fetchStatsUrl, clusterStatsPayload);
    const fetchBrokersMock = fetchMock.get(fetchBrokersUrl, brokersPayload);
    await act(() => {
      render(
        <WithRoute path={clusterBrokerPath()}>
          <Broker />
        </WithRoute>,
        {
          initialEntries: [clusterBrokerPath(clusterName, brokerId)],
        }
      );
    });
    await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
    expect(fetchBrokersMock.called()).toBeTruthy();
  };

  it('shows warning when server returns empty logDirs response', async () => {
    const fetchLogDirsMock = fetchMock.getOnce(fetchLogDirsUrl, [], {
      query: { broker: brokerId },
    });
    await renderComponent();
    await waitFor(() => expect(fetchLogDirsMock.called()).toBeTruthy());
    expect(screen.getByText('Log dir data not available')).toBeInTheDocument();
  });

  it('shows broker found', async () => {
    const fetchLogDirsMock = fetchMock.getOnce(
      fetchLogDirsUrl,
      brokerLogDirsPayload,
      {
        query: { broker: brokerId },
      }
    );

    await renderComponent();
    await waitFor(() => expect(fetchLogDirsMock.called()).toBeTruthy());
    const topicCount = screen.getByText(3);
    const partitionsCount = screen.getByText(4);
    expect(topicCount).toBeInTheDocument();
    expect(partitionsCount).toBeInTheDocument();
  });
});
