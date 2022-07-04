import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/dom';
import { clusterBrokerMetricsPath } from 'lib/paths';
import fetchMock from 'fetch-mock';
import { act } from '@testing-library/react';
import BrokerMetrics from 'components/Brokers/Broker/BrokerMetrics/BrokerMetrics';

const clusterName = 'local';
const brokerId = 1;
const fetchMetricsUrl = `/api/clusters/${clusterName}/brokers/${brokerId}/metrics`;

describe('BrokerMetrics Component', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  const renderComponent = async () => {
    const fetchMetricsMock = fetchMock.getOnce(fetchMetricsUrl, {});
    await act(() => {
      render(
        <WithRoute path={clusterBrokerMetricsPath()}>
          <BrokerMetrics />
        </WithRoute>,
        {
          initialEntries: [clusterBrokerMetricsPath(clusterName, brokerId)],
        }
      );
    });
    await waitFor(() => expect(fetchMetricsMock.called()).toBeTruthy());
  };

  it("shows warning when server doesn't return metrics response", async () => {
    await renderComponent();
    expect(screen.getAllByRole('textbox').length).toEqual(1);
  });
});
