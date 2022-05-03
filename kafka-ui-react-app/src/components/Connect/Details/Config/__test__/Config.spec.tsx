import React from 'react';
import { TestRouterWrapper } from 'lib/testHelpers';
import { clusterConnectConnectorConfigPath } from 'lib/paths';
import Config, { ConfigProps } from 'components/Connect/Details/Config/Config';
import { connector } from 'redux/reducers/connect/__test__/fixtures';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render } from '@testing-library/react';

jest.mock('components/common/PageLoader/PageLoader', () => 'mock-PageLoader');

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
    <TestRouterWrapper
      pathname={pathname}
      urlParams={{ clusterName, connectName, connectorName }}
    >
      <ThemeProvider theme={theme}>
        <Config
          fetchConfig={jest.fn()}
          isConfigFetching={false}
          config={connector.config}
          {...props}
        />
      </ThemeProvider>
    </TestRouterWrapper>
  );

  it('matches snapshot', () => {
    const { container } = render(component());
    expect(container).toBeInTheDocument();
  });

  it('matches snapshot when fetching config', () => {
    const { container } = render(component({ isConfigFetching: true }));
    expect(container).toBeInTheDocument();
  });

  it('is empty when no config', () => {
    const { container } = render(component({ config: null }));
    expect(container).toBeEmptyDOMElement();
  });

  it('fetches config on mount', () => {
    const fetchConfig = jest.fn();
    render(component({ fetchConfig }));
    expect(fetchConfig).toHaveBeenCalledTimes(1);
    expect(fetchConfig).toHaveBeenCalledWith(
      clusterName,
      connectName,
      connectorName,
      true
    );
  });
});
