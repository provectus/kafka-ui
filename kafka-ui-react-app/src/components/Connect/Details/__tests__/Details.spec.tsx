import React from 'react';
import { Route } from 'react-router-dom';
import { render } from 'lib/testHelpers';
import { clusterConnectConnectorPath } from 'lib/paths';
import Details, { DetailsProps } from 'components/Connect/Details/Details';
import { connector, tasks } from 'redux/reducers/connect/__test__/fixtures';
import { screen } from '@testing-library/dom';

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
    <Route path={pathname}>
      <Details
        fetchConnector={jest.fn()}
        fetchTasks={jest.fn()}
        isConnectorFetching={false}
        areTasksFetching={false}
        connector={connector}
        tasks={tasks}
        {...props}
      />
    </Route>
  );

  it('renders progressbar when fetching connector', () => {
    render(setupWrapper({ isConnectorFetching: true }), {
      pathname: clusterConnectConnectorPath(
        clusterName,
        connectName,
        connectorName
      ),
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders progressbar when fetching tasks', () => {
    render(setupWrapper({ areTasksFetching: true }), {
      pathname: clusterConnectConnectorPath(
        clusterName,
        connectName,
        connectorName
      ),
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('is empty when no connector', () => {
    const { container } = render(setupWrapper({ connector: null }), {
      pathname: clusterConnectConnectorPath(
        clusterName,
        connectName,
        connectorName
      ),
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('fetches connector on mount', () => {
    const fetchConnector = jest.fn();
    render(setupWrapper({ fetchConnector }), {
      pathname: clusterConnectConnectorPath(
        clusterName,
        connectName,
        connectorName
      ),
    });
    expect(fetchConnector).toHaveBeenCalledTimes(1);
    expect(fetchConnector).toHaveBeenCalledWith({
      clusterName,
      connectName,
      connectorName,
    });
  });

  it('fetches tasks on mount', () => {
    const fetchTasks = jest.fn();
    render(setupWrapper({ fetchTasks }), {
      pathname: clusterConnectConnectorPath(
        clusterName,
        connectName,
        connectorName
      ),
    });
    expect(fetchTasks).toHaveBeenCalledTimes(1);
    expect(fetchTasks).toHaveBeenCalledWith({
      clusterName,
      connectName,
      connectorName,
    });
  });
});
