import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import {
  clusterConnectConnectorConfigPath,
  clusterConnectConnectorPath,
  clusterConnectConnectorTasksPath,
  getNonExactPath,
} from 'lib/paths';
import Details, { DetailsProps } from 'components/Connect/Details/Details';
import { connector, tasks } from 'redux/reducers/connect/__test__/fixtures';
import { screen } from '@testing-library/dom';

const DetailsCompText = {
  overview: 'OverviewContainer',
  tasks: 'TasksContainer',
  config: 'ConfigContainer',
  actions: 'ActionsContainer',
};

jest.mock('components/Connect/Details/Overview/OverviewContainer', () => () => (
  <div>{DetailsCompText.overview}</div>
));

jest.mock('components/Connect/Details/Tasks/TasksContainer', () => () => (
  <div>{DetailsCompText.tasks}</div>
));

jest.mock('components/Connect/Details/Config/ConfigContainer', () => () => (
  <div>{DetailsCompText.config}</div>
));

jest.mock('components/Connect/Details/Actions/ActionsContainer', () => () => (
  <div>{DetailsCompText.actions}</div>
));

describe('Details', () => {
  const clusterName = 'my-cluster';
  const connectName = 'my-connect';
  const connectorName = 'my-connector';
  const defaultPath = clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  );

  const setupWrapper = (
    props: Partial<DetailsProps> = {},
    path: string = defaultPath
  ) =>
    render(
      <WithRoute path={getNonExactPath(clusterConnectConnectorPath())}>
        <Details
          fetchConnector={jest.fn()}
          fetchTasks={jest.fn()}
          isConnectorFetching={false}
          areTasksFetching={false}
          connector={connector}
          tasks={tasks}
          {...props}
        />
      </WithRoute>,
      { initialEntries: [path] }
    );

  it('renders progressbar when fetching connector', () => {
    setupWrapper({ isConnectorFetching: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders progressbar when fetching tasks', () => {
    setupWrapper({ areTasksFetching: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('is empty when no connector', () => {
    const { container } = setupWrapper({ connector: null });
    expect(container).toBeEmptyDOMElement();
  });

  it('fetches connector on mount', () => {
    const fetchConnector = jest.fn();
    setupWrapper({ fetchConnector });
    expect(fetchConnector).toHaveBeenCalledTimes(1);
    expect(fetchConnector).toHaveBeenCalledWith({
      clusterName,
      connectName,
      connectorName,
    });
  });

  it('fetches tasks on mount', () => {
    const fetchTasks = jest.fn();
    setupWrapper({ fetchTasks });
    expect(fetchTasks).toHaveBeenCalledTimes(1);
    expect(fetchTasks).toHaveBeenCalledWith({
      clusterName,
      connectName,
      connectorName,
    });
  });

  describe('Router component tests', () => {
    it('should test if overview is rendering', () => {
      setupWrapper({});
      expect(screen.getByText(DetailsCompText.overview));
    });

    it('should test if tasks is rendering', () => {
      setupWrapper(
        {},
        clusterConnectConnectorTasksPath(
          clusterName,
          connectName,
          connectorName
        )
      );
      expect(screen.getByText(DetailsCompText.tasks));
    });

    it('should test if list is rendering', () => {
      setupWrapper(
        {},
        clusterConnectConnectorConfigPath(
          clusterName,
          connectName,
          connectorName
        )
      );
      expect(screen.getByText(DetailsCompText.config));
    });
  });
});
