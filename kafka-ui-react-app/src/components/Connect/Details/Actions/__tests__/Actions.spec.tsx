import React from 'react';
import { create } from 'react-test-renderer';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { containerRendersView, TestRouterWrapper } from 'lib/testHelpers';
import { clusterConnectConnectorPath, clusterConnectorsPath } from 'lib/paths';
import ActionsContainer from 'components/Connect/Details/Actions/ActionsContainer';
import Actions, {
  ActionsProps,
} from 'components/Connect/Details/Actions/Actions';
import { ConnectorState } from 'generated-sources';
import { ConfirmationModalProps } from 'components/common/ConfirmationModal/ConfirmationModal';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

const mockHistoryPush = jest.fn();
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
  containerRendersView(<ActionsContainer />, Actions);

  describe('view', () => {
    const pathname = clusterConnectConnectorPath(
      ':clusterName',
      ':connectName',
      ':connectorName'
    );
    const clusterName = 'my-cluster';
    const connectName = 'my-connect';
    const connectorName = 'my-connector';

    const setupWrapper = (props: Partial<ActionsProps> = {}) => (
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
      const wrapper = create(setupWrapper());
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot when paused', () => {
      const wrapper = create(
        setupWrapper({ connectorStatus: ConnectorState.PAUSED })
      );
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot when failed', () => {
      const wrapper = create(
        setupWrapper({ connectorStatus: ConnectorState.FAILED })
      );
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot when unassigned', () => {
      const wrapper = create(
        setupWrapper({ connectorStatus: ConnectorState.UNASSIGNED })
      );
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot when deleting connector', () => {
      const wrapper = create(setupWrapper({ isConnectorDeleting: true }));
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot when running connector action', () => {
      const wrapper = create(setupWrapper({ isConnectorActionRunning: true }));
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('opens confirmation modal when delete button clicked and closes when cancel button clicked', () => {
      const deleteConnector = jest.fn();
      const wrapper = mount(setupWrapper({ deleteConnector }));
      wrapper.find({ children: 'Delete' }).simulate('click');
      let confirmationModalProps = wrapper
        .find('mock-ConfirmationModal')
        .props() as ConfirmationModalProps;
      expect(confirmationModalProps.isOpen).toBeTruthy();
      act(() => {
        confirmationModalProps.onCancel();
      });
      wrapper.update();
      confirmationModalProps = wrapper
        .find('mock-ConfirmationModal')
        .props() as ConfirmationModalProps;
      expect(confirmationModalProps.isOpen).toBeFalsy();
    });

    it('calls deleteConnector when confirm button clicked', () => {
      const deleteConnector = jest.fn();
      const wrapper = mount(setupWrapper({ deleteConnector }));
      (
        wrapper.find('mock-ConfirmationModal').props() as ConfirmationModalProps
      ).onConfirm();
      expect(deleteConnector).toHaveBeenCalledTimes(1);
      expect(deleteConnector).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName
      );
    });

    it('redirects after delete', async () => {
      const deleteConnector = jest
        .fn()
        .mockResolvedValueOnce({ message: 'success' });
      const wrapper = mount(setupWrapper({ deleteConnector }));
      await act(async () => {
        (
          wrapper
            .find('mock-ConfirmationModal')
            .props() as ConfirmationModalProps
        ).onConfirm();
      });
      expect(mockHistoryPush).toHaveBeenCalledTimes(1);
      expect(mockHistoryPush).toHaveBeenCalledWith(
        clusterConnectorsPath(clusterName)
      );
    });

    it('calls restartConnector when restart button clicked', () => {
      const restartConnector = jest.fn();
      const wrapper = mount(setupWrapper({ restartConnector }));
      wrapper.find({ children: 'Restart Connector' }).simulate('click');
      expect(restartConnector).toHaveBeenCalledTimes(1);
      expect(restartConnector).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName
      );
    });

    it('calls pauseConnector when pause button clicked', () => {
      const pauseConnector = jest.fn();
      const wrapper = mount(
        setupWrapper({
          connectorStatus: ConnectorState.RUNNING,
          pauseConnector,
        })
      );
      wrapper.find({ children: 'Pause' }).simulate('click');
      expect(pauseConnector).toHaveBeenCalledTimes(1);
      expect(pauseConnector).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName
      );
    });

    it('calls resumeConnector when resume button clicked', () => {
      const resumeConnector = jest.fn();
      const wrapper = mount(
        setupWrapper({
          connectorStatus: ConnectorState.PAUSED,
          resumeConnector,
        })
      );
      wrapper.find({ children: 'Resume' }).simulate('click');
      expect(resumeConnector).toHaveBeenCalledTimes(1);
      expect(resumeConnector).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName
      );
    });
  });
});
