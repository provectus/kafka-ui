import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import { clusterBrokerPath } from 'lib/paths';
import { act } from '@testing-library/react';
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
  const renderComponent = async (payload: BrokerLogdirs[] = []) => {
    (useBrokerLogDirs as jest.Mock).mockImplementation(() => ({
      data: payload,
    }));
    await act(() => {
      render(
        <WithRoute path={clusterBrokerPath()}>
          <BrokerLogdir />
        </WithRoute>,
        {
          initialEntries: [clusterBrokerPath(clusterName, brokerId)],
        }
      );
    });
  };

  it('shows warning when server returns empty logDirs response', async () => {
    await renderComponent();
    expect(screen.getByText('Log dir data not available')).toBeInTheDocument();
  });

  it('shows broker', async () => {
    await renderComponent(brokerLogDirsPayload);
    expect(screen.getByText('/opt/kafka/data-0/logs')).toBeInTheDocument();
  });
});
