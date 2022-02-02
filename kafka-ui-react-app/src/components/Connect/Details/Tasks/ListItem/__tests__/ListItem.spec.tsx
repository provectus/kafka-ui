import React from 'react';
import { render } from 'lib/testHelpers';
import { clusterConnectConnectorTasksPath } from 'lib/paths';
import ListItem, {
  ListItemProps,
} from 'components/Connect/Details/Tasks/ListItem/ListItem';
import { tasks } from 'redux/reducers/connect/__test__/fixtures';
import { Route } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const pathname = clusterConnectConnectorTasksPath(
  ':clusterName',
  ':connectName',
  ':connectorName'
);
const clusterName = 'my-cluster';
const connectName = 'my-connect';
const connectorName = 'my-connector';
const restartTask = jest.fn();
const task = tasks[0];

const renderComponent = (props: ListItemProps = { task, restartTask }) => {
  return render(
    <Route path={pathname}>
      <table>
        <tbody>
          <ListItem {...props} />
        </tbody>
      </table>
    </Route>,
    {
      pathname: clusterConnectConnectorTasksPath(
        clusterName,
        connectName,
        connectorName
      ),
    }
  );
};

describe('ListItem', () => {
  it('renders', () => {
    renderComponent();
    expect(screen.getByRole('row')).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: task.status.id.toString() })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: task.status.workerId })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: task.status.state })
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });
  it('calls restartTask on button click', () => {
    renderComponent();

    expect(restartTask).not.toBeCalled();
    userEvent.click(screen.getByRole('button'));
    userEvent.click(screen.getByRole('menuitem'));
    expect(restartTask).toBeCalledTimes(1);
    expect(restartTask).toHaveBeenCalledWith(
      clusterName,
      connectName,
      connectorName,
      task.id?.task
    );
  });
});
