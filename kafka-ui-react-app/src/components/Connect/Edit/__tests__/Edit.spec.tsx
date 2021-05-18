import React from 'react';
import { create } from 'react-test-renderer';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { containerRendersView, TestRouterWrapper } from 'lib/testHelpers';
import {
  clusterConnectConnectorConfigPath,
  clusterConnectConnectorEditPath,
} from 'lib/paths';
import EditContainer from 'components/Connect/Edit/EditContainer';
import Edit, { EditProps } from 'components/Connect/Edit/Edit';
import { connector } from 'redux/reducers/connect/__test__/fixtures';

jest.mock('components/common/PageLoader/PageLoader', () => 'mock-PageLoader');

jest.mock('components/common/JSONEditor/JSONEditor', () => 'mock-JSONEditor');

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('Edit', () => {
  containerRendersView(<EditContainer />, Edit);

  describe('view', () => {
    const pathname = clusterConnectConnectorEditPath(
      ':clusterName',
      ':connectName',
      ':connectorName'
    );
    const clusterName = 'my-cluster';
    const connectName = 'my-connect';
    const connectorName = 'my-connector';

    const setupWrapper = (props: Partial<EditProps> = {}) => (
      <TestRouterWrapper
        pathname={pathname}
        urlParams={{ clusterName, connectName, connectorName }}
      >
        <Edit
          fetchConfig={jest.fn()}
          isConfigFetching={false}
          config={connector.config}
          updateConfig={jest.fn()}
          {...props}
        />
      </TestRouterWrapper>
    );

    it('matches snapshot', () => {
      const wrapper = create(setupWrapper());
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('matches snapshot when fetching config', () => {
      const wrapper = create(setupWrapper({ isConfigFetching: true }));
      expect(wrapper.toJSON()).toMatchSnapshot();
    });

    it('fetches config on mount', () => {
      const fetchConfig = jest.fn();
      mount(setupWrapper({ fetchConfig }));
      expect(fetchConfig).toHaveBeenCalledTimes(1);
      expect(fetchConfig).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName
      );
    });

    it('calls updateConfig on form submit', async () => {
      const updateConfig = jest.fn();
      const wrapper = mount(setupWrapper({ updateConfig }));
      await act(async () => {
        wrapper.find('form').simulate('submit');
      });
      expect(updateConfig).toHaveBeenCalledTimes(1);
      expect(updateConfig).toHaveBeenCalledWith(
        clusterName,
        connectName,
        connectorName,
        connector.config
      );
    });

    it('redirects to connector config view on successful submit', async () => {
      const updateConfig = jest.fn().mockResolvedValueOnce(connector);
      const wrapper = mount(setupWrapper({ updateConfig }));
      await act(async () => {
        wrapper.find('form').simulate('submit');
      });
      expect(mockHistoryPush).toHaveBeenCalledTimes(1);
      expect(mockHistoryPush).toHaveBeenCalledWith(
        clusterConnectConnectorConfigPath(
          clusterName,
          connectName,
          connectorName
        )
      );
    });

    it('does not redirect to connector config view on unsuccessful submit', async () => {
      const updateConfig = jest.fn().mockResolvedValueOnce(undefined);
      const wrapper = mount(setupWrapper({ updateConfig }));
      await act(async () => {
        wrapper.find('form').simulate('submit');
      });
      expect(mockHistoryPush).not.toHaveBeenCalled();
    });
  });
});
