import React from 'react';
import { containerRendersView, render } from 'lib/testHelpers';
import {
  clusterConnectConnectorConfigPath,
  clusterConnectConnectorEditPath,
} from 'lib/paths';
import EditContainer from 'components/Connect/Edit/EditContainer';
import Edit, { EditProps } from 'components/Connect/Edit/Edit';
import { connector } from 'redux/reducers/connect/__test__/fixtures';
import { Route } from 'react-router';
import { waitFor } from '@testing-library/dom';
import { fireEvent, screen } from '@testing-library/react';

jest.mock('components/common/PageLoader/PageLoader', () => 'mock-PageLoader');

jest.mock('components/common/Editor/Editor', () => 'mock-Editor');

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

    const renderComponent = (props: Partial<EditProps> = {}) =>
      render(
        <Route path={pathname}>
          <Edit
            fetchConfig={jest.fn()}
            isConfigFetching={false}
            config={connector.config}
            updateConfig={jest.fn()}
            {...props}
          />
        </Route>,
        {
          pathname: clusterConnectConnectorEditPath(
            clusterName,
            connectName,
            connectorName
          ),
        }
      );

    it('fetches config on mount', () => {
      const fetchConfig = jest.fn();
      renderComponent({ fetchConfig });
      expect(fetchConfig).toHaveBeenCalledTimes(1);
      expect(fetchConfig).toHaveBeenCalledWith({
        clusterName,
        connectName,
        connectorName,
      });
    });

    it('calls updateConfig on form submit', async () => {
      const updateConfig = jest.fn();
      renderComponent({ updateConfig });
      await waitFor(() => fireEvent.submit(screen.getByRole('form')));
      expect(updateConfig).toHaveBeenCalledTimes(1);
      expect(updateConfig).toHaveBeenCalledWith({
        clusterName,
        connectName,
        connectorName,
        connectorConfig: connector.config,
      });
    });

    it('redirects to connector config view on successful submit', async () => {
      const updateConfig = jest.fn().mockResolvedValueOnce(connector);
      renderComponent({ updateConfig });
      await waitFor(() => fireEvent.submit(screen.getByRole('form')));
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
      renderComponent({ updateConfig });
      await waitFor(() => fireEvent.submit(screen.getByRole('form')));
      expect(mockHistoryPush).not.toHaveBeenCalled();
    });
  });
});
