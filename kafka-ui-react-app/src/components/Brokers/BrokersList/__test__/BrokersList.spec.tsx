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
import { useBrokers } from 'lib/hooks/api/brokers';
import { useClusterStats } from 'lib/hooks/api/clusters';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('lib/hooks/api/brokers', () => ({
  useBrokers: jest.fn(),
}));
jest.mock('lib/hooks/api/clusters', () => ({
  useClusterStats: jest.fn(),
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
    beforeEach(() => {
      (useBrokers as jest.Mock).mockImplementation(() => ({
        data: brokersPayload,
      }));
      (useClusterStats as jest.Mock).mockImplementation(() => ({
        data: clusterStatsPayload,
      }));
    });

    it('renders', async () => {
      renderComponent();
      expect(screen.getByRole('table')).toBeInTheDocument();
      const rows = screen.getAllByRole('row');
      expect(rows.length).toEqual(3);
    });
    it('opens broker when row clicked', async () => {
      renderComponent();
      await act(() => {
        userEvent.click(screen.getByRole('cell', { name: '0' }));
      });
      await waitFor(() => expect(mockedUsedNavigate).toBeCalledWith('0'));
    });
    it('shows warning when offlinePartitionCount > 0', async () => {
      (useClusterStats as jest.Mock).mockImplementation(() => ({
        data: {
          ...clusterStatsPayload,
          offlinePartitionCount: 1345,
        },
      }));
      renderComponent();
      const onlineWidget = screen.getByText(
        clusterStatsPayload.onlinePartitionCount
      );
      expect(onlineWidget).toBeInTheDocument();
      expect(onlineWidget).toHaveStyle({ color: '#E51A1A' });
    });
    it('shows right count when offlinePartitionCount > 0', async () => {
      (useClusterStats as jest.Mock).mockImplementation(() => ({
        data: {
          ...clusterStatsPayload,
          inSyncReplicasCount: testInSyncReplicasCount,
          outOfSyncReplicasCount: testOutOfSyncReplicasCount,
        },
      }));
      renderComponent();
      const onlineWidgetDef = screen.getByText(testInSyncReplicasCount);
      const onlineWidget = screen.getByText(
        `of ${testInSyncReplicasCount + testOutOfSyncReplicasCount}`
      );
      expect(onlineWidgetDef).toBeInTheDocument();
      expect(onlineWidget).toBeInTheDocument();
    });

    it('shows right count when inSyncReplicasCount: undefined outOfSyncReplicasCount: 1', async () => {
      (useClusterStats as jest.Mock).mockImplementation(() => ({
        data: {
          ...clusterStatsPayload,
          inSyncReplicasCount: undefined,
          outOfSyncReplicasCount: testOutOfSyncReplicasCount,
        },
      }));
      renderComponent();
      const onlineWidget = screen.getByText(`of ${testOutOfSyncReplicasCount}`);
      expect(onlineWidget).toBeInTheDocument();
    });
    it(`shows right count when inSyncReplicasCount: ${testInSyncReplicasCount} outOfSyncReplicasCount: undefined`, async () => {
      (useClusterStats as jest.Mock).mockImplementation(() => ({
        data: {
          ...clusterStatsPayload,
          inSyncReplicasCount: testInSyncReplicasCount,
          outOfSyncReplicasCount: undefined,
        },
      }));
      renderComponent();
      const onlineWidgetDef = screen.getByText(testInSyncReplicasCount);
      const onlineWidget = screen.getByText(`of ${testInSyncReplicasCount}`);
      expect(onlineWidgetDef).toBeInTheDocument();
      expect(onlineWidget).toBeInTheDocument();
    });
  });
});
