import React from 'react';
import DangerZone, {
  DangerZoneProps,
} from 'components/Topics/Topic/Edit/DangerZone/DangerZone';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, WithRoute } from 'lib/testHelpers';
import {
  useIncreaseTopicPartitionsCount,
  useUpdateTopicReplicationFactor,
} from 'lib/hooks/api/topics';
import { clusterTopicPath } from 'lib/paths';

const defaultPartitions = 3;
const defaultReplicationFactor = 3;

const clusterName = 'testCluster';
const topicName = 'testTopic';

jest.mock('lib/hooks/api/topics', () => ({
  useIncreaseTopicPartitionsCount: jest.fn(),
  useUpdateTopicReplicationFactor: jest.fn(),
}));

const renderComponent = (props?: Partial<DangerZoneProps>) =>
  render(
    <WithRoute path={clusterTopicPath()}>
      <DangerZone
        defaultPartitions={defaultPartitions}
        defaultReplicationFactor={defaultReplicationFactor}
        {...props}
      />
    </WithRoute>,
    { initialEntries: [clusterTopicPath(clusterName, topicName)] }
  );

const clickOnDialogSubmitButton = async () => {
  await userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Confirm',
    })
  );
};

const checkDialogThenPressCancel = async () => {
  const dialog = screen.getByRole('dialog');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
};

describe('DangerZone', () => {
  it('renders the component', () => {
    renderComponent();

    const numberOfPartitionsEditForm = screen.getByRole('form', {
      name: 'Edit number of partitions',
    });
    expect(numberOfPartitionsEditForm).toBeInTheDocument();
    expect(
      within(numberOfPartitionsEditForm).getByRole('spinbutton', {
        name: 'Number of partitions *',
      })
    ).toBeInTheDocument();
    expect(
      within(numberOfPartitionsEditForm).getByRole('button', { name: 'Submit' })
    ).toBeInTheDocument();

    const replicationFactorEditForm = screen.getByRole('form', {
      name: 'Edit replication factor',
    });
    expect(replicationFactorEditForm).toBeInTheDocument();
    expect(
      within(replicationFactorEditForm).getByRole('spinbutton', {
        name: 'Replication Factor *',
      })
    ).toBeInTheDocument();
    expect(
      within(replicationFactorEditForm).getByRole('button', { name: 'Submit' })
    ).toBeInTheDocument();
  });

  it('calls increaseTopicPartitionsCount mutation', async () => {
    const mockIncreaseTopicPartitionsCount = jest.fn();
    (useIncreaseTopicPartitionsCount as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockIncreaseTopicPartitionsCount,
    }));
    renderComponent();
    const numberOfPartitionsEditForm = screen.getByRole('form', {
      name: 'Edit number of partitions',
    });
    await userEvent.type(
      within(numberOfPartitionsEditForm).getByRole('spinbutton'),
      '4'
    );
    await userEvent.click(
      within(numberOfPartitionsEditForm).getByRole('button')
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await clickOnDialogSubmitButton();
    expect(mockIncreaseTopicPartitionsCount).toHaveBeenCalledTimes(1);
  });

  it('calls updateTopicReplicationFactor', async () => {
    const mockUpdateTopicReplicationFactor = jest.fn();
    (useUpdateTopicReplicationFactor as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockUpdateTopicReplicationFactor,
    }));
    renderComponent();
    const replicationFactorEditForm = screen.getByRole('form', {
      name: 'Edit replication factor',
    });
    expect(
      within(replicationFactorEditForm).getByRole('spinbutton', {
        name: 'Replication Factor *',
      })
    ).toBeInTheDocument();
    expect(
      within(replicationFactorEditForm).getByRole('button', { name: 'Submit' })
    ).toBeInTheDocument();

    await userEvent.type(
      within(replicationFactorEditForm).getByRole('spinbutton'),
      '4'
    );
    await userEvent.click(
      within(replicationFactorEditForm).getByRole('button')
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await clickOnDialogSubmitButton();

    expect(mockUpdateTopicReplicationFactor).toHaveBeenCalledTimes(1);
  });

  it('should view the validation error when partition value is lower than the default passed or empty', async () => {
    renderComponent();
    const partitionInput = screen.getByPlaceholderText('Number of partitions');
    const partitionInputSubmitBtn = screen.getAllByText(/submit/i)[0];
    const value = (defaultPartitions - 4).toString();
    expect(partitionInputSubmitBtn).toBeDisabled();

    await userEvent.clear(partitionInput);
    await userEvent.type(partitionInput, value);

    expect(partitionInput).toHaveValue(+value);
    expect(partitionInputSubmitBtn).toBeEnabled();

    await userEvent.click(partitionInputSubmitBtn);

    expect(
      screen.getByText(/You can only increase the number of partitions!/i)
    ).toBeInTheDocument();
    await userEvent.clear(partitionInput);
    expect(screen.getByText(/are required/i)).toBeInTheDocument();
  });

  it('should view the validation error when Replication Facto value is lower than the default passed or empty', async () => {
    renderComponent();
    const replicatorFactorInput =
      screen.getByPlaceholderText('Replication Factor');
    const replicatorFactorInputSubmitBtn = screen.getAllByText(/submit/i)[1];

    await userEvent.clear(replicatorFactorInput);

    expect(replicatorFactorInputSubmitBtn).toBeEnabled();
    await userEvent.click(replicatorFactorInputSubmitBtn);
    expect(screen.getByText(/are required/i)).toBeInTheDocument();
    await userEvent.type(replicatorFactorInput, '1');
    expect(screen.queryByText(/are required/i)).not.toBeInTheDocument();
  });

  it('should close the partitions dialog if he cancel button is pressed', async () => {
    renderComponent();

    const partitionInput = screen.getByPlaceholderText('Number of partitions');
    const partitionInputSubmitBtn = screen.getAllByText(/submit/i)[0];

    await userEvent.type(partitionInput, '5');
    await userEvent.click(partitionInputSubmitBtn);

    await checkDialogThenPressCancel();
  });

  it('should close the replicator dialog if he cancel button is pressed', async () => {
    renderComponent();
    const replicatorFactorInput =
      screen.getByPlaceholderText('Replication Factor');
    const replicatorFactorInputSubmitBtn = screen.getAllByText(/submit/i)[1];

    await userEvent.type(replicatorFactorInput, '5');
    await userEvent.click(replicatorFactorInputSubmitBtn);

    await checkDialogThenPressCancel();
  });
});
