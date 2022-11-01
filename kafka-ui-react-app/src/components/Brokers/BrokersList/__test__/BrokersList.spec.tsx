import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/dom';
import { clusterBrokerPath, clusterBrokersPath } from 'lib/paths';
import BrokersList from 'components/Brokers/BrokersList/BrokersList';
import userEvent from '@testing-library/user-event';
import { useBrokers } from 'lib/hooks/api/brokers';
import { useClusterStats } from 'lib/hooks/api/clusters';
import { brokersPayload } from 'lib/fixtures/brokers';
import { clusterStatsPayload } from 'lib/fixtures/clusters';

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
    describe('when the brokers are loaded', () => {
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
        expect(screen.getAllByRole('row').length).toEqual(3);
      });
      it('opens broker when row clicked', async () => {
        renderComponent();
        await userEvent.click(screen.getByRole('cell', { name: '0' }));

        await waitFor(() =>
          expect(mockedUsedNavigate).toBeCalledWith(
            clusterBrokerPath(clusterName, '0')
          )
        );
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
      it('shows right count when inSyncReplicasCount: undefined && outOfSyncReplicasCount: 1', async () => {
        (useClusterStats as jest.Mock).mockImplementation(() => ({
          data: {
            ...clusterStatsPayload,
            inSyncReplicasCount: undefined,
            outOfSyncReplicasCount: testOutOfSyncReplicasCount,
          },
        }));
        renderComponent();
        const onlineWidget = screen.getByText(
          `of ${testOutOfSyncReplicasCount}`
        );
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

    describe('when diskUsage is empty', () => {
      beforeEach(() => {
        (useBrokers as jest.Mock).mockImplementation(() => ({
          data: brokersPayload,
        }));
        (useClusterStats as jest.Mock).mockImplementation(() => ({
          data: { ...clusterStatsPayload, diskUsage: undefined },
        }));
      });

      it('renders empty table', async () => {
        renderComponent();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(
          screen.getByRole('row', { name: 'Disk usage data not available' })
        ).toBeInTheDocument();
      });
    });
  });
});
