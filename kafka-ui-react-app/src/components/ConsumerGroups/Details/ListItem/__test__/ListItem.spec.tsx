import React from 'react';
import ListItem, {
  Props,
} from 'components/ConsumerGroups/Details/ListItem/ListItem';
import { render } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/react';
import {
  clusterName,
  name,
  partition,
} from 'components/ConsumerGroups/Details/__test__/fixtures';
import userEvent from '@testing-library/user-event';

const fakeProps = {
  clusterName,
  name,
  consumers: [partition],
};

const renderComponent = (props: Props = fakeProps) =>
  render(
    <table>
      <tbody>
        <ListItem {...props} />
      </tbody>
    </table>
  );

describe('ListItem', () => {
  it('renders', () => {
    renderComponent();

    expect(screen.getByRole('cell', { name })).toBeInTheDocument();
  });

  it('opens consumer info on click', async () => {
    renderComponent();

    await waitFor(() => userEvent.click(screen.getByRole('button')));

    expect(
      screen.getByRole('cell', { name: partition.partition.toString() })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: partition.consumerId.toString() })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: partition.host.toString() })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: partition.messagesBehind.toString() })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: partition.currentOffset.toString() })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: partition.endOffset.toString() })
    ).toBeInTheDocument();
  });
});
