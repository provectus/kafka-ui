import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/dom';
import { clusterBrokersPath } from 'lib/paths';
import fetchMock from 'fetch-mock';
import { act } from '@testing-library/react';
import BrokersList from 'components/Brokers/BrokersList/BrokersList';
import {
  brokersPayload,
  clusterStatsPayload,
} from 'components/Brokers/__test__/fixtures';
import userEvent from '@testing-library/user-event';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('BrokersList Component', () => {
  afterEach(() => fetchMock.reset());

  const clusterName = 'local';

  const testInSyncReplicasCount = 798;
  const testOutOfSyncReplicasCount = 1;

  const renderComponent = () =>
    render(
      <WithRoute path={clusterBrokersPath()}>
        <BrokersList />
      </WithRoute>,
      {
        initialEntries: [clusterBrokersPath(clusterName)],
      }
    );

  describe('BrokersList', () => {
    let fetchBrokersMock: fetchMock.FetchMockStatic;
    const fetchStatsUrl = `/api/clusters/${clusterName}/stats`;

    beforeEach(() => {
      fetchBrokersMock = fetchMock.get(
        `/api/clusters/${clusterName}/brokers`,
        brokersPayload
      );
    });

    it('renders', async () => {
      const fetchStatsMock = fetchMock.get(fetchStatsUrl, clusterStatsPayload);
      await act(() => {
        renderComponent();
      });

      await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchBrokersMock.called()).toBeTruthy());

      expect(screen.getByRole('table')).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(3);
    });

    it('opens broker when row clicked', async () => {
      const fetchStatsMock = fetchMock.get(fetchStatsUrl, clusterStatsPayload);
      await act(() => {
        renderComponent();
      });
      await waitFor(() => expect(fetchStatsMock.called()).toBeTruthy());
      await act(() => {
        userEvent.click(screen.getByRole('cell', { name: '0' }));
      });

      await waitFor(() => {
        expect(mockedUsedNavigate).toBeCalled();
        expect(mockedUsedNavigate).toBeCalledWith('0');
      });
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
