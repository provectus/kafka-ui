import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterConnectConnectorPath } from 'lib/paths';
import Actions from 'components/Connect/Details/Actions/Actions';
import { ConnectorAction, ConnectorState } from 'generated-sources';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useConnector,
  useUpdateConnectorState,
} from 'lib/hooks/api/kafkaConnect';
import { connector } from 'lib/fixtures/kafkaConnect';
import set from 'lodash/set';

const mockHistoryPush = jest.fn();
const deleteConnector = jest.fn();
const cancelMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockHistoryPush,
}));

jest.mock('lib/hooks/api/kafkaConnect', () => ({
  useConnector: jest.fn(),
  useDeleteConnector: jest.fn(),
  useUpdateConnectorState: jest.fn(),
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

  describe('view', () => {
    const route = clusterConnectConnectorPath();
    const path = clusterConnectConnectorPath(
      'myCluster',
      'myConnect',
      'myConnector'
    );

    const renderComponent = () =>
      render(
        <WithRoute path={route}>
          <Actions />
        </WithRoute>,
        { initialEntries: [path] }
      );

    it('renders buttons when paused', () => {
      (useConnector as jest.Mock).mockImplementation(() => ({
        data: set({ ...connector }, 'status.state', ConnectorState.PAUSED),
      }));
      renderComponent();
      expect(screen.getAllByRole('button').length).toEqual(6);
      expect(screen.getByText('Resume')).toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();
      expectActionButtonsExists();
    });

    it('renders buttons when failed', () => {
      (useConnector as jest.Mock).mockImplementation(() => ({
        data: set({ ...connector }, 'status.state', ConnectorState.FAILED),
      }));
      renderComponent();
      expect(screen.getAllByRole('button').length).toEqual(5);
      expect(screen.queryByText('Resume')).not.toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();
      expectActionButtonsExists();
    });

    it('renders buttons when unassigned', () => {
      (useConnector as jest.Mock).mockImplementation(() => ({
        data: set({ ...connector }, 'status.state', ConnectorState.UNASSIGNED),
      }));
      renderComponent();
      expect(screen.getAllByRole('button').length).toEqual(5);
      expect(screen.queryByText('Resume')).not.toBeInTheDocument();
      expect(screen.queryByText('Pause')).not.toBeInTheDocument();
      expectActionButtonsExists();
    });

    it('renders buttons when running connector action', () => {
      (useConnector as jest.Mock).mockImplementation(() => ({
        data: set({ ...connector }, 'status.state', ConnectorState.RUNNING),
      }));
      renderComponent();
      expect(screen.getAllByRole('button').length).toEqual(6);
      expect(screen.queryByText('Resume')).not.toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expectActionButtonsExists();
    });

    describe('mutations', () => {
      beforeEach(() => {
        (useConnector as jest.Mock).mockImplementation(() => ({
          data: set({ ...connector }, 'status.state', ConnectorState.RUNNING),
        }));
      });

      it('opens confirmation modal when delete button clicked', async () => {
        renderComponent();
        userEvent.click(screen.getByRole('button', { name: 'Delete' }));
        expect(
          screen.getByText(/Are you sure you want to remove/i)
        ).toHaveAttribute('isopen', 'true');
      });

      it('calls restartConnector when restart button clicked', () => {
        const restartConnector = jest.fn();
        (useUpdateConnectorState as jest.Mock).mockImplementation(() => ({
          mutateAsync: restartConnector,
        }));
        renderComponent();
        userEvent.click(
          screen.getByRole('button', { name: 'Restart Connector' })
        );
        expect(restartConnector).toHaveBeenCalledWith(ConnectorAction.RESTART);
      });

      it('calls restartAllTasks', () => {
        const restartAllTasks = jest.fn();
        (useUpdateConnectorState as jest.Mock).mockImplementation(() => ({
          mutateAsync: restartAllTasks,
        }));
        renderComponent();
        userEvent.click(
          screen.getByRole('button', { name: 'Restart All Tasks' })
        );
        expect(restartAllTasks).toHaveBeenCalledWith(
          ConnectorAction.RESTART_ALL_TASKS
        );
      });

      it('calls restartFailedTasks', () => {
        const restartFailedTasks = jest.fn();
        (useUpdateConnectorState as jest.Mock).mockImplementation(() => ({
          mutateAsync: restartFailedTasks,
        }));
        renderComponent();
        userEvent.click(
          screen.getByRole('button', { name: 'Restart Failed Tasks' })
        );
        expect(restartFailedTasks).toHaveBeenCalledWith(
          ConnectorAction.RESTART_FAILED_TASKS
        );
      });

      it('calls pauseConnector when pause button clicked', () => {
        const pauseConnector = jest.fn();
        (useUpdateConnectorState as jest.Mock).mockImplementation(() => ({
          mutateAsync: pauseConnector,
        }));
        renderComponent();
        userEvent.click(screen.getByRole('button', { name: 'Pause' }));
        expect(pauseConnector).toHaveBeenCalledWith(ConnectorAction.PAUSE);
      });

      it('calls resumeConnector when resume button clicked', () => {
        const resumeConnector = jest.fn();
        (useConnector as jest.Mock).mockImplementation(() => ({
          data: set({ ...connector }, 'status.state', ConnectorState.PAUSED),
        }));
        (useUpdateConnectorState as jest.Mock).mockImplementation(() => ({
          mutateAsync: resumeConnector,
        }));
        renderComponent();
        userEvent.click(screen.getByRole('button', { name: 'Resume' }));
        expect(resumeConnector).toHaveBeenCalledWith(ConnectorAction.RESUME);
      });
    });
  });
});
