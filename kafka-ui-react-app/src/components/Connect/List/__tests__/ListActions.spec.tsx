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
import { clusterConnectorsPath } from 'lib/paths';
import {
  useConnectors,
  useDeleteConnector,
  useUpdateConnectorState,
} from 'lib/hooks/api/kafkaConnect';
import { ConnectorAction } from 'generated-sources';

const mockedUsedNavigate = jest.fn();
const mockDelete = jest.fn();
const mutateAsync = jest.fn();

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

function handleButtonClick(buttonTitle: string) {
  const actionButton = screen.getAllByText(buttonTitle)[0];

  userEvent.click(actionButton);
}

describe('Connectors List Actions', () => {

  beforeEach(() => {
    (useConnectors as jest.Mock).mockImplementation(() => ({
      data: connectors,
    }));
    (useDeleteConnector as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockDelete,
    }));
    (useUpdateConnectorState as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
  });

  it('changes connector state to RESTART_ALL_TASKS', () => {
    renderComponent();
    handleButtonClick('Restart All Tasks');
    expect(mutateAsync).toHaveBeenCalledWith(ConnectorAction.RESTART_ALL_TASKS);
  });

  it('changes connector state to RESTART', () => {
    renderComponent();
    handleButtonClick('Restart Connector');
    expect(mutateAsync).toHaveBeenCalledWith(ConnectorAction.RESTART);
  });

  it('changes connector state to RESTART_FAILED_TASKS', () => {
    renderComponent();
    handleButtonClick('Restart Failed Tasks');
    expect(mutateAsync).toHaveBeenCalledWith(
      ConnectorAction.RESTART_FAILED_TASKS
    );
  });

  it('should exist action buttons', () => {
    renderComponent();

    expect(screen.queryAllByText('Remove Connector')[0]).toBeInTheDocument();
    expect(screen.queryAllByText('Restart Connector')[0]).toBeInTheDocument();
    expect(screen.queryAllByText('Restart All Tasks')[0]).toBeInTheDocument();
    expect(
      screen.queryAllByText('Restart Failed Tasks')[0]
    ).toBeInTheDocument();
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
