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
import { useConnectors, useDeleteConnector } from 'lib/hooks/api/kafkaConnect';

const mockedUsedNavigate = jest.fn();
const mockDelete = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('lib/hooks/api/kafkaConnect', () => ({
  useConnectors: jest.fn(),
  useDeleteConnector: jest.fn(),
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

  describe('when remove connector modal is open', () => {
    beforeEach(() => {
      (useConnectors as jest.Mock).mockImplementation(() => ({
        data: connectors,
      }));
      (useDeleteConnector as jest.Mock).mockImplementation(() => ({
        mutateAsync: mockDelete,
      }));
    });

    it('calls removeConnector on confirm', async () => {
      renderComponent();
      const removeButton = screen.getAllByText('Remove Connector')[0];
      await waitFor(() => userEvent.click(removeButton));

      const submitButton = screen.getAllByRole('button', {
        name: 'Confirm',
      })[0];
      await userEvent.click(submitButton);
      expect(mockDelete).toHaveBeenCalledWith();
    });

    it('closes the modal when cancel button is clicked', async () => {
      renderComponent();
      const removeButton = screen.getAllByText('Remove Connector')[0];
      await waitFor(() => userEvent.click(removeButton));

      const cancelButton = screen.getAllByRole('button', {
        name: 'Cancel',
      })[0];
      await waitFor(() => userEvent.click(cancelButton));
      expect(cancelButton).not.toBeInTheDocument();
    });
  });
});
