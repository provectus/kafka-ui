import React from 'react';
import { render } from 'lib/testHelpers';
import { Route } from 'react-router-dom';
import { clusterConnectConnectorConfigPath } from 'lib/paths';
import Config, { ConfigProps } from 'components/Connect/Details/Config/Config';
import { connector } from 'redux/reducers/connect/__test__/fixtures';
import { screen } from '@testing-library/dom';

jest.mock('components/common/Editor/Editor', () => 'mock-Editor');

describe('Config', () => {
  const pathname = clusterConnectConnectorConfigPath(
    ':clusterName',
    ':connectName',
    ':connectorName'
  );
  const clusterName = 'my-cluster';
  const connectName = 'my-connect';
  const connectorName = 'my-connector';

  const component = (props: Partial<ConfigProps> = {}) => (
    <Route path={pathname}>
      <Config
        fetchConfig={jest.fn()}
        isConfigFetching={false}
        config={connector.config}
        {...props}
      />
    </Route>
  );

  it('to be in the document when fetching config', () => {
    render(component({ isConfigFetching: true }), {
      pathname: clusterConnectConnectorConfigPath(
        clusterName,
        connectName,
        connectorName
      ),
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('is empty when no config', () => {
    const { container } = render(component({ config: null }), {
      pathname: clusterConnectConnectorConfigPath(
        clusterName,
        connectName,
        connectorName
      ),
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('fetches config on mount', () => {
    const fetchConfig = jest.fn();
    render(component({ fetchConfig }), {
      pathname: clusterConnectConnectorConfigPath(
        clusterName,
        connectName,
        connectorName
      ),
    });
    expect(fetchConfig).toHaveBeenCalledTimes(1);
    expect(fetchConfig).toHaveBeenCalledWith({
      clusterName,
      connectName,
      connectorName,
    });
  });
});
