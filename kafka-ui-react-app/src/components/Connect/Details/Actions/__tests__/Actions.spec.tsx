import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterConnectConnectorPath, clusterConnectorsPath } from 'lib/paths';
import ActionsContainer from 'components/Connect/Details/Actions/ActionsContainer';
import Actions, {
  ActionsProps,
} from 'components/Connect/Details/Actions/Actions';
import { ConnectorState } from 'generated-sources';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationModal, {
  ConfirmationModalProps,
} from 'components/common/ConfirmationModal/ConfirmationModal';

const mockHistoryPush = jest.fn();
const deleteConnector = jest.fn();
const cancelMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockHistoryPush,
}));

jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

const expectActionButtonsExists = () => {
  expect(screen.getByText('Restart Connector')).toBeInTheDocument();
  expect(screen.getByText('Restart All Tasks')).toBeInTheDocument();
  expect(screen.getByText('Restart Failed Tasks')).toBeInTheDocument();
  expect(screen.getByText('Edit Config')).toBeInTheDocument();
  expect(screen.getByText('Delete')).toBeInTheDocument();
};

describe('Actions', () => {
  afterEach(() => {
    mockHistoryPush.mockClear();
    deleteConnector.mockClear();
    cancelMock.mockClear();
  });

  const actionsContainer = (props: Partial<ActionsProps> = {}) => (
    <ActionsContainer>
      <Actions
        deleteConnector={jest.fn()}
        isConnectorDeleting={false}
        connectorStatus={ConnectorState.RUNNING}
        restartConnector={jest.fn()}
        restartTasks={jest.fn()}
        pauseConnector={jest.fn()}
        resumeConnector={jest.fn()}
        isConnectorActionRunning={false}
        {...props}
      />
    </ActionsContainer>
  );

  it('container renders view', () => {
    const { container } = render(actionsContainer());
    expect(container).toBeInTheDocument();
  });

  describe('view', () => {
    const pathname = clusterConnectConnectorPath();
    const clusterName = 'my-cluster';
    const connectName = 'my-connect';
    const connectorName = 'my-connector';

    const confirmationModal = (props: Partial<ConfirmationModalProps> = {}) => (
      <WithRoute path={pathname}>
        <ConfirmationModal
          onCancel={cancelMock}
          onConfirm={() =>
            deleteConnector(clusterName, connectName, connectorName)
          }
          {...props}
        >
          <button type="button" onClick={cancelMock}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              deleteConnector(clusterName, connectName, connectorName);
              mockHistoryPush(clusterConnectorsPath(clusterName));
            }}
          >
            Confirm
          </button>
        </ConfirmationModal>
      </WithRoute>
    );

    const component = (props: Partial<ActionsProps> = {}) => (
      <WithRoute path={pathname}>
        <Actions
          deleteConnector={jest.fn()}
          isConnectorDeleting={false}
          connectorStatus={ConnectorState.RUNNING}
          restartConnector={jest.fn()}
          restartTasks={jest.fn()}
          pauseConnector={jest.fn()}
          resumeConnector={jest.fn()}
          isConnectorActionRunning={false}
          {...props}
        />
      </WithRoute>
    );

    it('renders buttons when paused', () => {
      render(component({ connectorStatus: ConnectorState.PAUSED }), {
        initialEntries: [
          clusterConnectConnectorPath(clusterName, connectName, connectorName),
        ],
      });
      expect(screen.getAllByRole('button').length).toEqual(6);
      expect(screen.getByText('Resume')).toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();

      expectActionButtonsExists();
    });

    it('renders buttons when failed', () => {
      render(component({ connectorStatus: ConnectorState.FAILED }), {
        initialEntries: [
          clusterConnectConnectorPath(clusterName, connectName, connectorName),
        ],
      });
      expect(screen.getAllByRole('button').length).toEqual(5);

      expect(screen.queryByText('Resume')).not.toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();

      expectActionButtonsExists();
    });

    it('renders buttons when unassigned', () => {
      render(component({ connectorStatus: ConnectorState.UNASSIGNED }), {
        initialEntries: [
          clusterConnectConnectorPath(clusterName, connectName, connectorName),
        ],
      });
      expect(screen.getAllByRole('button').length).toEqual(5);
      expect(screen.queryByText('Resume')).not.toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();
      expectActionButtonsExists();
    });

    it('renders buttons when running connector action', () => {
      render(component({ connectorStatus: ConnectorState.RUNNING }), {
        initialEntries: [
          clusterConnectConnectorPath(clusterName, connectName, connectorName),
        ],
      });
      expect(screen.getAllByRole('button').length).toEqual(6);
      expect(screen.queryByText('Resume')).not.toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();

      expectActionButtonsExists();
    });

    it('opens confirmation modal when delete button clicked', () => {
      render(component({ deleteConnector }), {
        initialEntries: [
          clusterConnectConnectorPath(clusterName, connectName, connectorName),
        ],
      });
      userEvent.click(screen.getByRole('button', { name: 'Delete' }));

      expect(
        screen.getByText(/Are you sure you want to remove/i)
      ).toHaveAttribute('isopen', 'true');
    });

    it('closes when cancel button clicked', () => {
      render(confirmationModal({ isOpen: true }), {
        initialEntries: [
          clusterConnectConnectorPath(clusterName, connectName, connectorName),
        ],
      });
      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      userEvent.click(cancelBtn);
      expect(cancelMock).toHaveBeenCalledTimes(1);
    });

    it('calls deleteConnector when confirm button clicked', () => {
      render(confirmationModal({ isOpen: true }), {
        initialEntries: [
          clusterConnectConnectorPath(clusterName, connectName, connectorName),
        ],
      });
      const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
      userEvent.click(confirmBtn);
      expect(deleteConnector).toHaveBeenCalledTimes(1);
      expect(deleteConnector).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName
      );
    });

    it('redirects after delete', async () => {
      render(confirmationModal({ isOpen: true }), {
        initialEntries: [
          clusterConnectConnectorPath(clusterName, connectName, connectorName),
        ],
      });
      const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
      userEvent.click(confirmBtn);
      expect(mockHistoryPush).toHaveBeenCalledTimes(1);
      expect(mockHistoryPush).toHaveBeenCalledWith(
        clusterConnectorsPath(clusterName)
      );
    });

    it('calls restartConnector when restart button clicked', () => {
      const restartConnector = jest.fn();
      render(component({ restartConnector }), {
        initialEntries: [
          clusterConnectConnectorPath(clusterName, connectName, connectorName),
        ],
      });
      userEvent.click(
        screen.getByRole('button', { name: 'Restart Connector' })
      );
      expect(restartConnector).toHaveBeenCalledTimes(1);
      expect(restartConnector).toHaveBeenCalledWith({
        clusterName,
        connectName,
        connectorName,
      });
    });

    it('calls pauseConnector when pause button clicked', () => {
      const pauseConnector = jest.fn();
      render(
        component({
          connectorStatus: ConnectorState.RUNNING,
          pauseConnector,
        }),
        {
          initialEntries: [
            clusterConnectConnectorPath(
              clusterName,
              connectName,
              connectorName
            ),
          ],
        }
      );
      userEvent.click(screen.getByRole('button', { name: 'Pause' }));
      expect(pauseConnector).toHaveBeenCalledTimes(1);
      expect(pauseConnector).toHaveBeenCalledWith({
        clusterName,
        connectName,
        connectorName,
      });
    });

    it('calls resumeConnector when resume button clicked', () => {
      const resumeConnector = jest.fn();
      render(
        component({
          connectorStatus: ConnectorState.PAUSED,
          resumeConnector,
        }),
        {
          initialEntries: [
            clusterConnectConnectorPath(
              clusterName,
              connectName,
              connectorName
            ),
          ],
        }
      );
      userEvent.click(screen.getByRole('button', { name: 'Resume' }));
      expect(resumeConnector).toHaveBeenCalledTimes(1);
      expect(resumeConnector).toHaveBeenCalledWith({
        clusterName,
        connectName,
        connectorName,
      });
    });
  });
});
