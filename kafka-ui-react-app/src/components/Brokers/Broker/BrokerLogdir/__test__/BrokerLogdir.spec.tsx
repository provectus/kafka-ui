import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import { clusterBrokerPath } from 'lib/paths';
import { brokerLogDirsPayload } from 'lib/fixtures/brokers';
import { useBrokerLogDirs } from 'lib/hooks/api/brokers';
import { BrokerLogdirs } from 'generated-sources';
import BrokerLogdir from 'components/Brokers/Broker/BrokerLogdir/BrokerLogdir';

jest.mock('lib/hooks/api/brokers', () => ({
  useBrokerLogDirs: jest.fn(),
}));

const clusterName = 'local';
const brokerId = 1;

describe('BrokerLogdir Component', () => {
  const renderComponent = async (payload?: BrokerLogdirs[]) => {
    (useBrokerLogDirs as jest.Mock).mockImplementation(() => ({
      data: payload,
    }));
    await render(
      <WithRoute path={clusterBrokerPath()}>
        <BrokerLogdir />
      </WithRoute>,
      {
        initialEntries: [clusterBrokerPath(clusterName, brokerId)],
      }
    );
  };

  it('shows warning when server returns undefined logDirs response', async () => {
    await renderComponent();
    expect(
      screen.getByRole('row', { name: 'Log dir data not available' })
    ).toBeInTheDocument();
  });

  it('shows warning when server returns empty logDirs response', async () => {
    await renderComponent([]);
    expect(
      screen.getByRole('row', { name: 'Log dir data not available' })
    ).toBeInTheDocument();
  });

  it('shows brokers', async () => {
    await renderComponent(brokerLogDirsPayload);
    expect(
      screen.queryByRole('row', { name: 'Log dir data not available' })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('row', {
        name: '/opt/kafka/data-0/logs NONE 3 4',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('row', {
        name: '/opt/kafka/data-1/logs NONE 0 0',
      })
    ).toBeInTheDocument();
  });
});
