import React from 'react';
import { TestRouterWrapper } from 'lib/testHelpers';
import { clusterConnectConnectorPath, clusterConnectorsPath } from 'lib/paths';
import ActionsContainer from 'components/Connect/Details/Actions/ActionsContainer';
import Actions, {
  ActionsProps,
} from 'components/Connect/Details/Actions/Actions';
import { ConnectorState } from 'generated-sources';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationModal, {
  ConfirmationModalProps,
} from 'components/common/ConfirmationModal/ConfirmationModal';
import { store } from 'redux/store';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router';

const mockHistoryPush = jest.fn();
const deleteConnector = jest.fn();
const cancelMock = jest.fn();

const history = createMemoryHistory();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

describe('Actions', () => {
  const actionsContainer = (props: Partial<ActionsProps> = {}) => (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router history={history}>
          <ActionsContainer>
            <Actions
              data-testid="actions_view"
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
        </Router>
      </Provider>
    </ThemeProvider>
  );

  it('container renders view', () => {
    render(actionsContainer());
    expect(screen.getByTestId('actions_view')).toBeInTheDocument();
  });

  describe('view', () => {
    const pathname = clusterConnectConnectorPath(
      ':clusterName',
      ':connectName',
      ':connectorName'
    );
    const clusterName = 'my-cluster';
    const connectName = 'my-connect';
    const connectorName = 'my-connector';

    const confirmationModal = (props: Partial<ConfirmationModalProps> = {}) => (
      <ThemeProvider theme={theme}>
        <TestRouterWrapper
          pathname={pathname}
          urlParams={{ clusterName, connectName, connectorName }}
        >
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
        </TestRouterWrapper>
      </ThemeProvider>
    );

    const component = (props: Partial<ActionsProps> = {}) => (
      <ThemeProvider theme={theme}>
        <TestRouterWrapper
          pathname={pathname}
          urlParams={{ clusterName, connectName, connectorName }}
        >
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
        </TestRouterWrapper>
      </ThemeProvider>
    );

    it('matches snapshot', () => {
      render(component());
      expect(screen).toMatchSnapshot();
    });

    it('matches snapshot when paused', () => {
      render(component({ connectorStatus: ConnectorState.PAUSED }));
      expect(screen).toMatchSnapshot();
    });

    it('matches snapshot when failed', () => {
      render(component({ connectorStatus: ConnectorState.FAILED }));
      expect(screen).toMatchSnapshot();
    });

    it('matches snapshot when unassigned', () => {
      render(component({ connectorStatus: ConnectorState.UNASSIGNED }));
      expect(screen).toMatchSnapshot();
    });

    it('matches snapshot when deleting connector', () => {
      render(component({ isConnectorDeleting: true }));
      expect(screen).toMatchSnapshot();
    });

    it('matches snapshot when running connector action', () => {
      render(component({ isConnectorActionRunning: true }));
      expect(screen).toMatchSnapshot();
    });

    it('opens confirmation modal when delete button clicked', () => {
      render(component({ deleteConnector }));
      userEvent.click(screen.getByRole('button', { name: 'Delete' }));

      expect(
        screen.getByText(/Are you sure you want to remove/i)
      ).toHaveAttribute('isopen', 'true');
    });

    it('closes when cancel button clicked', () => {
      render(confirmationModal({ isOpen: true }));
      const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
      userEvent.click(cancelBtn);
      expect(cancelMock).toHaveBeenCalledTimes(1);
    });

    it('calls deleteConnector when confirm button clicked', () => {
      render(confirmationModal({ isOpen: true }));
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
      render(confirmationModal({ isOpen: true }));
      const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
      userEvent.click(confirmBtn);
      expect(mockHistoryPush).toHaveBeenCalledTimes(1);
      expect(mockHistoryPush).toHaveBeenCalledWith(
        clusterConnectorsPath(clusterName)
      );
    });

    it('calls restartConnector when restart button clicked', () => {
      const restartConnector = jest.fn();
      render(component({ restartConnector }));
      userEvent.click(
        screen.getByRole('button', { name: 'Restart Connector' })
      );
      expect(restartConnector).toHaveBeenCalledTimes(1);
      expect(restartConnector).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName
      );
    });

    it('calls pauseConnector when pause button clicked', () => {
      const pauseConnector = jest.fn();
      render(
        component({
          connectorStatus: ConnectorState.RUNNING,
          pauseConnector,
        })
      );
      userEvent.click(screen.getByRole('button', { name: 'Pause' }));
      expect(pauseConnector).toHaveBeenCalledTimes(1);
      expect(pauseConnector).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName
      );
    });

    it('calls resumeConnector when resume button clicked', () => {
      const resumeConnector = jest.fn();
      render(
        component({
          connectorStatus: ConnectorState.PAUSED,
          resumeConnector,
        })
      );
      userEvent.click(screen.getByRole('button', { name: 'Resume' }));
      expect(resumeConnector).toHaveBeenCalledTimes(1);
      expect(resumeConnector).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName
      );
    });
  });
});
