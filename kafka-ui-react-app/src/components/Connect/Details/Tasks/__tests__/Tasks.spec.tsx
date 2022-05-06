import React from 'react';
import { TestRouterWrapper } from 'lib/testHelpers';
import { clusterConnectConnectorTasksPath } from 'lib/paths';
import TasksContainer from 'components/Connect/Details/Tasks/TasksContainer';
import Tasks, { TasksProps } from 'components/Connect/Details/Tasks/Tasks';
import { tasks } from 'redux/reducers/connect/__test__/fixtures';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from 'redux/store';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';

jest.mock('components/common/PageLoader/PageLoader', () => 'mock-PageLoader');

jest.mock(
  'components/Connect/Details/Tasks/ListItem/ListItemContainer',
  () => 'tr'
);

const history = createMemoryHistory();

describe('Tasks', () => {
  const tasksContainer = (props: Partial<TasksProps> = {}) => (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router history={history}>
          <TasksContainer>
            <Tasks areTasksFetching={false} tasks={tasks} {...props} />
          </TasksContainer>
        </Router>
      </Provider>
    </ThemeProvider>
  );

  it('container renders view', () => {
    const { container } = render(tasksContainer());
    expect(container).toBeInTheDocument();
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
      <ThemeProvider theme={theme}>
        <TestRouterWrapper
          pathname={pathname}
          urlParams={{ clusterName, connectName, connectorName }}
        >
          <Tasks areTasksFetching={false} tasks={tasks} {...props} />
        </TestRouterWrapper>
      </ThemeProvider>
    );

    it('to be in the document when fetching tasks', () => {
      const { container } = render(setupWrapper({ areTasksFetching: true }));
      expect(container).toBeInTheDocument();
    });

    it('to be in the document when no tasks', () => {
      const { container } = render(setupWrapper({ tasks: [] }));
      expect(container).toBeInTheDocument();
    });
  });
});
