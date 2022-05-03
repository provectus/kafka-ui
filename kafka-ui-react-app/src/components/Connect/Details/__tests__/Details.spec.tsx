import React from 'react';
import { TestRouterWrapper, render } from 'lib/testHelpers';
import { clusterConnectConnectorPath } from 'lib/paths';
import Details, { DetailsProps } from 'components/Connect/Details/Details';
import { connector, tasks } from 'redux/reducers/connect/__test__/fixtures';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

jest.mock('components/common/PageLoader/PageLoader', () => 'mock-PageLoader');

jest.mock(
  'components/Connect/Details/Overview/OverviewContainer',
  () => 'mock-OverviewContainer'
);

jest.mock(
  'components/Connect/Details/Tasks/TasksContainer',
  () => 'mock-TasksContainer'
);

jest.mock(
  'components/Connect/Details/Config/ConfigContainer',
  () => 'mock-ConfigContainer'
);

jest.mock(
  'components/Connect/Details/Actions/ActionsContainer',
  () => 'mock-ActionsContainer'
);

describe('Details', () => {
  const pathname = clusterConnectConnectorPath(
    ':clusterName',
    ':connectName',
    ':connectorName'
  );
  const clusterName = 'my-cluster';
  const connectName = 'my-connect';
  const connectorName = 'my-connector';

  const setupWrapper = (props: Partial<DetailsProps> = {}) => (
    <ThemeProvider theme={theme}>
      <TestRouterWrapper
        pathname={pathname}
        urlParams={{ clusterName, connectName, connectorName }}
      >
        <Details
          fetchConnector={jest.fn()}
          fetchTasks={jest.fn()}
          isConnectorFetching={false}
          areTasksFetching={false}
          connector={connector}
          tasks={tasks}
          {...props}
        />
      </TestRouterWrapper>
    </ThemeProvider>
  );

  it('matches snapshot', () => {
    const { container } = render(setupWrapper());
    expect(container).toBeInTheDocument();
  });

  it('matches snapshot when fetching connector', () => {
    const { container } = render(setupWrapper({ isConnectorFetching: true }));
    expect(container).toBeInTheDocument();
  });

  it('matches snapshot when fetching tasks', () => {
    const { container } = render(setupWrapper({ areTasksFetching: true }));
    expect(container).toBeInTheDocument();
  });

  it('is empty when no connector', () => {
    const wrapper = render(setupWrapper({ connector: null })).baseElement;
    expect(wrapper.querySelector('div')).toBeEmptyDOMElement();
  });

  it('fetches connector on mount', () => {
    const fetchConnector = jest.fn();
    render(setupWrapper({ fetchConnector }));
    expect(fetchConnector).toHaveBeenCalledTimes(1);
    expect(fetchConnector).toHaveBeenCalledWith(
      clusterName,
      connectName,
      connectorName
    );
  });

  it('fetches tasks on mount', () => {
    const fetchTasks = jest.fn();
    render(setupWrapper({ fetchTasks }));
    expect(fetchTasks).toHaveBeenCalledTimes(1);
    expect(fetchTasks).toHaveBeenCalledWith(
      clusterName,
      connectName,
      connectorName
    );
  });
});
