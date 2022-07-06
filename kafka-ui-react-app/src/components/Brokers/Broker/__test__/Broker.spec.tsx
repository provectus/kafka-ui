import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/dom';
import {
  clusterBrokerMetricsPath,
  clusterBrokerPath,
  getNonExactPath,
} from 'lib/paths';
import fetchMock from 'fetch-mock';
import { act } from '@testing-library/react';
import Broker from 'components/Brokers/Broker/Broker';
import {
  clusterStatsPayload,
  brokersPayload,
} from 'components/Brokers/__test__/fixtures';

const clusterName = 'local';
const brokerId = 1;
const activeClassName = 'is-active';
const fetchStatsUrl = `/api/clusters/${clusterName}/stats`;
const fetchBrokersUrl = `/api/clusters/${clusterName}/brokers`;
const brokerLogdir = {
  pageText: 'brokerLogdir',
  navigationName: 'Log directories',
};
const brokerMetrics = {
  pageText: 'brokerMetrics',
  navigationName: 'Metrics',
};

jest.mock('components/Brokers/Broker/BrokerLogdir/BrokerLogdir', () => () => (
  <div>{brokerLogdir.pageText}</div>
));
jest.mock('components/Brokers/Broker/BrokerMetrics/BrokerMetrics', () => () => (
  <div>{brokerMetrics.pageText}</div>
));

describe('Broker Component', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  const renderComponent = async (
    path = clusterBrokerPath(clusterName, brokerId)
  ) => {
    const fetchStatsMock = fetchMock.get(fetchStatsUrl, clusterStatsPayload);
    const fetchBrokersMock = fetchMock.get(fetchBrokersUrl, brokersPayload);
    await act(() => {
      render(
        <WithRoute path={getNonExactPath(clusterBrokerPath())}>
          <Broker />
        </WithRoute>,
        {
          initialEntries: [path],
        }
      );
    });
    await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
    expect(fetchBrokersMock.called()).toBeTruthy();
  };

  it('shows broker found', async () => {
    await renderComponent();
    const brokerInfo = brokersPayload.find((broker) => broker.id === brokerId);
    const brokerDiskUsage = clusterStatsPayload.diskUsage.find(
      (disk) => disk.brokerId === brokerId
    );

    expect(
      screen.getByText(brokerDiskUsage?.segmentCount || '')
    ).toBeInTheDocument();
    expect(screen.getByText('12MB')).toBeInTheDocument();

    expect(screen.getByText('Segment Count')).toBeInTheDocument();
    expect(
      screen.getByText(brokerDiskUsage?.segmentCount || '')
    ).toBeInTheDocument();

    expect(screen.getByText('Port')).toBeInTheDocument();
    expect(screen.getByText(brokerInfo?.port || '')).toBeInTheDocument();

    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText(brokerInfo?.host || '')).toBeInTheDocument();
  });

  it('renders Broker Logdir', async () => {
    await renderComponent();

    const logdirLink = screen.getByRole('link', {
      name: brokerLogdir.navigationName,
    });
    expect(logdirLink).toBeInTheDocument();
    expect(logdirLink).toHaveClass(activeClassName);

    expect(screen.getByText(brokerLogdir.pageText)).toBeInTheDocument();
  });

  it('renders Broker Metrics', async () => {
    await renderComponent(clusterBrokerMetricsPath(clusterName, brokerId));

    const metricsLink = screen.getByRole('link', {
      name: brokerMetrics.navigationName,
    });
    expect(metricsLink).toBeInTheDocument();
    expect(metricsLink).toHaveClass(activeClassName);

    expect(screen.getByText(brokerMetrics.pageText)).toBeInTheDocument();
  });
});
