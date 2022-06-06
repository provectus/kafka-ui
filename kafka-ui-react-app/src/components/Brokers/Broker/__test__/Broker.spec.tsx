import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/dom';
import { clusterBrokerPath } from 'lib/paths';
import fetchMock from 'fetch-mock';
import { clusterStatsPayloadBroker } from 'redux/reducers/brokers/__test__/fixtures';
import { act } from '@testing-library/react';
import Broker from 'components/Brokers/Broker/Broker';
import { BrokersLogdirs } from 'generated-sources';

describe('Broker Component', () => {
  afterEach(() => fetchMock.reset());

  const clusterName = 'local';
  const brokerId = 1;

  const renderComponent = () =>
    render(
      <WithRoute path={clusterBrokerPath()}>
        <Broker />
      </WithRoute>,
      {
        initialEntries: [clusterBrokerPath(clusterName, brokerId)],
      }
    );

  describe('Broker', () => {
    const fetchBrokerMockUrl = `/api/clusters/${clusterName}/brokers/logdirs?broker=${brokerId}`;

    const actRender = async (
      mockData: BrokersLogdirs[] = clusterStatsPayloadBroker
    ) => {
      const fetchBrokerMock = fetchMock.getOnce(fetchBrokerMockUrl, mockData);

      await act(() => {
        renderComponent();
      });
      await waitFor(() => expect(fetchBrokerMock.called()).toBeTruthy());
    };

    it('renders', async () => {
      await actRender();

      expect(screen.getByRole('table')).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(2);
    });

    it('show warning when broker not found', async () => {
      await actRender([]);

      expect(
        screen.getByText('Log dir data not available')
      ).toBeInTheDocument();
    });

    it('show broker found', async () => {
      await actRender();
      const topicCount = screen.getByText(
        clusterStatsPayloadBroker[0].topics?.length || 0
      );
      const partitionsCount = screen.getByText(
        clusterStatsPayloadBroker[0].topics?.reduce(
          (previousValue, currentValue) =>
            previousValue + (currentValue.partitions?.length || 0),
          0
        ) || 0
      );
      expect(topicCount).toBeInTheDocument();
      expect(partitionsCount).toBeInTheDocument();
    });

    it('show 0s when broker has not topics', async () => {
      await actRender([{ ...clusterStatsPayloadBroker[0], topics: undefined }]);

      expect(screen.getAllByText(0).length).toEqual(2);
    });

    it('show - when broker has not name', async () => {
      await actRender([{ ...clusterStatsPayloadBroker[0], name: undefined }]);

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('show - when broker has not error', async () => {
      await actRender([{ ...clusterStatsPayloadBroker[0], error: undefined }]);
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});
