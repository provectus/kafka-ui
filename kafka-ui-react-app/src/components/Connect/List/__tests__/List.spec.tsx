import React from 'react';
import { connectors } from 'lib/fixtures/kafkaConnect';
import ClusterContext, {
  ContextProps,
  initialValue,
} from 'components/contexts/ClusterContext';
import List from 'components/Connect/List/List';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterConnectConnectorPath, clusterConnectorsPath } from 'lib/paths';
import { useConnectors } from 'lib/hooks/api/kafkaConnect';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('lib/hooks/api/kafkaConnect', () => ({
  useConnectors: jest.fn(),
  useDeleteConnector: jest.fn(),
  useUpdateConnectorState: jest.fn(),
}));

const clusterName = 'local';

const renderComponent = (contextValue: ContextProps = initialValue) =>
  render(
    <ClusterContext.Provider value={contextValue}>
      <WithRoute path={clusterConnectorsPath()}>
        <List />
      </WithRoute>
    </ClusterContext.Provider>,
    { initialEntries: [clusterConnectorsPath(clusterName)] }
  );

describe('Connectors List', () => {
  describe('when the connectors are loaded', () => {
    beforeEach(() => {
      (useConnectors as jest.Mock).mockImplementation(() => ({
        data: connectors,
      }));
    });

    it('renders', async () => {
      renderComponent();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('row').length).toEqual(3);
    });

    it('opens broker when row clicked', async () => {
      renderComponent();
      await userEvent.click(
        screen.getByRole('row', {
          name: 'hdfs-source-connector first SOURCE FileStreamSource a b c RUNNING 2 of 2',
        })
      );
      await waitFor(() =>
        expect(mockedUsedNavigate).toBeCalledWith(
          clusterConnectConnectorPath(
            clusterName,
            'first',
            'hdfs-source-connector'
          )
        )
      );
    });
  });

  describe('when table is empty', () => {
    beforeEach(() => {
      (useConnectors as jest.Mock).mockImplementation(() => ({
        data: [],
      }));
    });

    it('renders empty table', async () => {
      renderComponent();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(
        screen.getByRole('row', { name: 'No connectors found' })
      ).toBeInTheDocument();
    });
  });
});
