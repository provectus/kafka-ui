import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterConnectConnectorTasksPath } from 'lib/paths';
import Tasks from 'components/Connect/Details/Tasks/Tasks';
import { tasks } from 'lib/fixtures/kafkaConnect';
import { screen } from '@testing-library/dom';
import { useConnectorTasks } from 'lib/hooks/api/kafkaConnect';

jest.mock('lib/hooks/api/kafkaConnect', () => ({
  useConnectorTasks: jest.fn(),
  useRestartConnectorTask: jest.fn(),
}));

const path = clusterConnectConnectorTasksPath('local', 'ghp', '1');

describe('Tasks', () => {
  const renderComponent = () =>
    render(
      <WithRoute path={clusterConnectConnectorTasksPath()}>
        <Tasks />
      </WithRoute>,
      { initialEntries: [path] }
    );

  it('renders empty table', () => {
    (useConnectorTasks as jest.Mock).mockImplementation(() => ({
      data: [],
    }));

    renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
  });

  it('renders tasks table', () => {
    (useConnectorTasks as jest.Mock).mockImplementation(() => ({
      data: tasks,
    }));
    renderComponent();
    expect(screen.getAllByRole('row').length).toEqual(tasks.length + 1);
  });
});
