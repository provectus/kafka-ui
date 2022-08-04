import React from 'react';
import { connectors } from 'lib/fixtures/kafkaConnect';
import ListItem, { ListItemProps } from 'components/Connect/List/ListItem';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('Connectors ListItem', () => {
  const connector = connectors[0];
  const setupWrapper = (props: Partial<ListItemProps> = {}) => (
    <table>
      <tbody>
        <ListItem clusterName="local" connector={connector} {...props} />
      </tbody>
    </table>
  );

  it('renders item', () => {
    render(setupWrapper());
    expect(screen.getAllByRole('cell')[6]).toHaveTextContent('2 of 2');
  });

  it('topics tags are sorted', () => {
    render(setupWrapper());
    const getLink = screen.getAllByRole('link');
    expect(getLink[1]).toHaveTextContent('a');
    expect(getLink[2]).toHaveTextContent('b');
    expect(getLink[3]).toHaveTextContent('c');
  });

  it('renders item with failed tasks', () => {
    render(
      setupWrapper({
        connector: {
          ...connector,
          failedTasksCount: 1,
        },
      })
    );
    expect(screen.getAllByRole('cell')[6]).toHaveTextContent('1 of 2');
  });

  it('does not render info about tasks if taksCount is undefined', () => {
    render(
      setupWrapper({
        connector: {
          ...connector,
          tasksCount: undefined,
        },
      })
    );
    expect(screen.getAllByRole('cell')[6]).toHaveTextContent('');
  });
});
