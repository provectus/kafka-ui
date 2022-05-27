import React from 'react';
import Brokers from 'components/Brokers/Brokers';
import { render, WithRoute } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/dom';
import { clusterBrokersPath } from 'lib/paths';
import fetchMock from 'fetch-mock';
import { clusterStatsPayload } from 'redux/reducers/brokers/__test__/fixtures';
import { act } from '@testing-library/react';

describe('Brokers Component', () => {
  afterEach(() => fetchMock.reset());

  const clusterName = 'local';

  const testInSyncReplicasCount = 798;
  const testOutOfSyncReplicasCount = 1;

  const renderComponent = () =>
    render(
      <WithRoute path={clusterBrokersPath()}>
        <Brokers />
      </WithRoute>,
      {
        initialEntries: [clusterBrokersPath(clusterName)],
      }
    );

  describe('Brokers', () => {
    let fetchBrokersMock: fetchMock.FetchMockStatic;
    const fetchStatsUrl = `/api/clusters/${clusterName}/stats`;

    beforeEach(() => {
      fetchBrokersMock = fetchMock.getOnce(
        `/api/clusters/${clusterName}/brokers`,
        clusterStatsPayload
      );
    });

    it('renders', async () => {
      const fetchStatsMock = fetchMock.getOnce(
        fetchStatsUrl,
        clusterStatsPayload
      );
      await act(() => {
        renderComponent();
      });

      await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokersMock.called()).toBeTruthy());

      expect(screen.getByRole('table')).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(3);
    });

    it('shows warning when offlinePartitionCount > 0', async () => {
      const fetchStatsMock = fetchMock.getOnce(fetchStatsUrl, {
        ...clusterStatsPayload,
        offlinePartitionCount: 1345,
      });
      await act(() => {
        renderComponent();
      });
      await waitFor(() => {
        expect(fetchStatsMock.called()).toBeTruthy();
      });
      await waitFor(() => {
        expect(fetchBrokersMock.called()).toBeTruthy();
      });
      const onlineWidget = screen.getByText(
        clusterStatsPayload.onlinePartitionCount
      );
      expect(onlineWidget).toBeInTheDocument();
      expect(onlineWidget).toHaveStyle({ color: '#E51A1A' });
    });
    it('shows right count when offlinePartitionCount > 0', async () => {
      const fetchStatsMock = fetchMock.getOnce(fetchStatsUrl, {
        ...clusterStatsPayload,
        inSyncReplicasCount: testInSyncReplicasCount,
        outOfSyncReplicasCount: testOutOfSyncReplicasCount,
      });
      await act(() => {
        renderComponent();
      });
      await waitFor(() => {
        expect(fetchStatsMock.called()).toBeTruthy();
      });

      const onlineWidgetDef = screen.getByText(testInSyncReplicasCount);
      const onlineWidget = screen.getByText(
        `of ${testInSyncReplicasCount + testOutOfSyncReplicasCount}`
      );
      expect(onlineWidgetDef).toBeInTheDocument();
      expect(onlineWidget).toBeInTheDocument();
    });
    it('shows right count when inSyncReplicasCount: undefined outOfSyncReplicasCount: 1', async () => {
      const fetchStatsMock = fetchMock.getOnce(fetchStatsUrl, {
        ...clusterStatsPayload,
        inSyncReplicasCount: undefined,
        outOfSyncReplicasCount: testOutOfSyncReplicasCount,
      });
      await act(() => {
        renderComponent();
      });
      await waitFor(() => {
        expect(fetchStatsMock.called()).toBeTruthy();
      });

      const onlineWidget = screen.getByText(`of ${testOutOfSyncReplicasCount}`);
      expect(onlineWidget).toBeInTheDocument();
    });
    it(`shows right count when inSyncReplicasCount: ${testInSyncReplicasCount} outOfSyncReplicasCount: undefined`, async () => {
      const fetchStatsMock = fetchMock.getOnce(fetchStatsUrl, {
        ...clusterStatsPayload,
        inSyncReplicasCount: testInSyncReplicasCount,
        outOfSyncReplicasCount: undefined,
      });
      await act(() => {
        renderComponent();
      });
      await waitFor(() => {
        expect(fetchStatsMock.called()).toBeTruthy();
      });
      const onlineWidgetDef = screen.getByText(testInSyncReplicasCount);
      const onlineWidget = screen.getByText(`of ${testInSyncReplicasCount}`);
      expect(onlineWidgetDef).toBeInTheDocument();
      expect(onlineWidget).toBeInTheDocument();
    });
  });
});
