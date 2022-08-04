import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import { clusterBrokerMetricsPath } from 'lib/paths';
import BrokerMetrics from 'components/Brokers/Broker/BrokerMetrics/BrokerMetrics';
import { useBrokerMetrics } from 'lib/hooks/api/brokers';

jest.mock('lib/hooks/api/brokers', () => ({
  useBrokerMetrics: jest.fn(),
}));

const clusterName = 'local';
const brokerId = 1;

describe('BrokerMetrics Component', () => {
  it("shows warning when server doesn't return metrics response", async () => {
    (useBrokerMetrics as jest.Mock).mockImplementation(() => ({
      data: {},
    }));

    render(
      <WithRoute path={clusterBrokerMetricsPath()}>
        <BrokerMetrics />
      </WithRoute>,
      {
        initialEntries: [clusterBrokerMetricsPath(clusterName, brokerId)],
      }
    );
    expect(screen.getAllByRole('textbox').length).toEqual(1);
  });
});
