import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import {
  clusterBrokerMetricsPath,
  clusterBrokerPath,
  getNonExactPath,
} from 'lib/paths';
import Broker from 'components/Brokers/Broker/Broker';
import { useBrokers } from 'lib/hooks/api/brokers';
import { useClusterStats } from 'lib/hooks/api/clusters';
import { brokersPayload } from 'lib/fixtures/brokers';
import { clusterStatsPayload } from 'lib/fixtures/clusters';

const clusterName = 'local';
const brokerId = 1;
const activeClassName = 'is-active';
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
jest.mock('lib/hooks/api/brokers', () => ({
  useBrokers: jest.fn(),
}));
jest.mock('lib/hooks/api/clusters', () => ({
  useClusterStats: jest.fn(),
}));

describe('Broker Component', () => {
  beforeEach(() => {
    (useBrokers as jest.Mock).mockImplementation(() => ({
      data: brokersPayload,
    }));
    (useClusterStats as jest.Mock).mockImplementation(() => ({
      data: clusterStatsPayload,
    }));
  });
  const renderComponent = (path = clusterBrokerPath(clusterName, brokerId)) =>
    render(
      <WithRoute path={getNonExactPath(clusterBrokerPath())}>
        <Broker />
      </WithRoute>,
      {
        initialEntries: [path],
      }
    );

  it('shows broker found', async () => {
    await renderComponent();
    const brokerInfo = brokersPayload.find((broker) => broker.id === brokerId);
    const brokerDiskUsage = clusterStatsPayload.diskUsage.find(
      (disk) => disk.brokerId === brokerId
    );

    expect(
      screen.getByText(brokerDiskUsage?.segmentCount || '')
    ).toBeInTheDocument();
    expect(screen.getByText('12 MB')).toBeInTheDocument();

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
