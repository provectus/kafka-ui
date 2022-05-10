import React from 'react';
import { render } from 'lib/testHelpers';
import { clusterConnectConnectorTasksPath } from 'lib/paths';
import TasksContainer from 'components/Connect/Details/Tasks/TasksContainer';
import Tasks, { TasksProps } from 'components/Connect/Details/Tasks/Tasks';
import { tasks } from 'redux/reducers/connect/__test__/fixtures';
import { Route } from 'react-router-dom';
import { screen } from '@testing-library/dom';

jest.mock(
  'components/Connect/Details/Tasks/ListItem/ListItemContainer',
  () => 'tr'
);

describe('Tasks', () => {
  it('container renders view', () => {
    render(<TasksContainer />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  describe('view', () => {
    const pathname = clusterConnectConnectorTasksPath(
      ':clusterName',
      ':connectName',
      ':connectorName'
    );
    const clusterName = 'my-cluster';
    const connectName = 'my-connect';
    const connectorName = 'my-connector';

    const setupWrapper = (props: Partial<TasksProps> = {}) => (
      <Route path={pathname}>
        <Tasks areTasksFetching={false} tasks={tasks} {...props} />
      </Route>
    );

    it('to be in the document when fetching tasks', () => {
      render(setupWrapper({ areTasksFetching: true }), {
        pathname: clusterConnectConnectorTasksPath(
          clusterName,
          connectName,
          connectorName
        ),
      });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('to be in the document when no tasks', () => {
      render(setupWrapper({ tasks: [] }), {
        pathname: clusterConnectConnectorTasksPath(
          clusterName,
          connectName,
          connectorName
        ),
      });
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('No tasks found')).toBeInTheDocument();
    });
  });
});
