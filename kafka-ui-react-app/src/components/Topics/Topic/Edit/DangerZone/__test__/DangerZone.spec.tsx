import React from 'react';
import DangerZone, {
  Props,
} from 'components/Topics/Topic/Edit/DangerZone/DangerZone';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, WithRoute } from 'lib/testHelpers';
import {
  topicName,
  clusterName,
} from 'components/Topics/Topic/Edit/__test__/fixtures';
import { clusterTopicSendMessagePath } from 'lib/paths';

const defaultPartitions = 3;
const defaultReplicationFactor = 3;

const renderComponent = (props?: Partial<Props>) =>
  render(
    <WithRoute path={clusterTopicSendMessagePath()}>
      <DangerZone
        defaultPartitions={defaultPartitions}
        defaultReplicationFactor={defaultReplicationFactor}
        partitionsCountIncreased={false}
        replicationFactorUpdated={false}
        updateTopicPartitionsCount={jest.fn()}
        updateTopicReplicationFactor={jest.fn()}
        {...props}
      />
    </WithRoute>,
    { initialEntries: [clusterTopicSendMessagePath(clusterName, topicName)] }
  );

const clickOnDialogSubmitButton = () => {
  userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Submit',
    })
  );
};

const checkDialogThenPressCancel = async () => {
  const dialog = screen.getByRole('dialog');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  userEvent.click(within(dialog).getByText(/cancel/i));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  );
};

describe('DangerZone', () => {
  it('renders the component', async () => {
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

  it('calls updateTopicPartitionsCount', async () => {
    const mockUpdateTopicPartitionsCount = jest.fn();
    renderComponent({
      updateTopicPartitionsCount: mockUpdateTopicPartitionsCount,
    });
    const numberOfPartitionsEditForm = screen.getByRole('form', {
      name: 'Edit number of partitions',
    });

    userEvent.type(
      within(numberOfPartitionsEditForm).getByRole('spinbutton'),
      '4'
    );
    userEvent.click(within(numberOfPartitionsEditForm).getByRole('button'));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    await waitFor(() => clickOnDialogSubmitButton());

    expect(mockUpdateTopicPartitionsCount).toHaveBeenCalledTimes(1);
  });

  it('calls updateTopicReplicationFactor', async () => {
    const mockUpdateTopicReplicationFactor = jest.fn();
    renderComponent({
      updateTopicReplicationFactor: mockUpdateTopicReplicationFactor,
    });

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

    userEvent.type(
      within(replicationFactorEditForm).getByRole('spinbutton'),
      '4'
    );
    userEvent.click(within(replicationFactorEditForm).getByRole('button'));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    await waitFor(() => clickOnDialogSubmitButton());

    await waitFor(() => {
      expect(mockUpdateTopicReplicationFactor).toHaveBeenCalledTimes(1);
    });
  });

  it('should view the validation error when partition value is lower than the default passed or empty', async () => {
    renderComponent();
    const partitionInput = screen.getByPlaceholderText('Number of partitions');
    const partitionInputSubmitBtn = screen.getAllByText(/submit/i)[0];
    const value = (defaultPartitions - 4).toString();
    expect(partitionInputSubmitBtn).toBeDisabled();
    await act(() => {
      userEvent.clear(partitionInput);
      userEvent.type(partitionInput, value);
    });
    expect(partitionInput).toHaveValue(+value);
    expect(partitionInputSubmitBtn).toBeEnabled();
    await act(() => {
      userEvent.click(partitionInputSubmitBtn);
    });
    expect(
      screen.getByText(/You can only increase the number of partitions!/i)
    ).toBeInTheDocument();
    userEvent.clear(partitionInput);
    await waitFor(() =>
      expect(screen.getByText(/are required/i)).toBeInTheDocument()
    );
  });

  it('should view the validation error when Replication Facto value is lower than the default passed or empty', async () => {
    renderComponent();
    const replicatorFactorInput =
      screen.getByPlaceholderText('Replication Factor');
    const replicatorFactorInputSubmitBtn = screen.getAllByText(/submit/i)[1];

    await waitFor(() => userEvent.clear(replicatorFactorInput));

    expect(replicatorFactorInputSubmitBtn).toBeEnabled();
    userEvent.click(replicatorFactorInputSubmitBtn);
    await waitFor(() =>
      expect(screen.getByText(/are required/i)).toBeInTheDocument()
    );
    userEvent.type(replicatorFactorInput, '1');
    await waitFor(() =>
      expect(screen.queryByText(/are required/i)).not.toBeInTheDocument()
    );
  });

  it('should close any popup if the partitionsCount is Increased ', async () => {
    renderComponent({ partitionsCountIncreased: true });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('should close any popup if the replicationFactor is Updated', async () => {
    renderComponent({ replicationFactorUpdated: true });
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('should already opened Confirmation popup if partitionsCount is Increased', async () => {
    const { rerender } = renderComponent();
    const partitionInput = screen.getByPlaceholderText('Number of partitions');
    const partitionInputSubmitBtn = screen.getAllByText(/submit/i)[0];

    await waitFor(() => {
      userEvent.type(partitionInput, '5');
    });

    userEvent.click(partitionInputSubmitBtn);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    rerender(
      <DangerZone
        defaultPartitions={defaultPartitions}
        defaultReplicationFactor={defaultReplicationFactor}
        partitionsCountIncreased
        replicationFactorUpdated={false}
        updateTopicPartitionsCount={jest.fn()}
        updateTopicReplicationFactor={jest.fn()}
      />
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('should already opened Confirmation popup if replicationFactor is Increased', async () => {
    const { rerender } = renderComponent();
    const replicatorFactorInput =
      screen.getByPlaceholderText('Replication Factor');
    const replicatorFactorInputSubmitBtn = screen.getAllByText(/submit/i)[1];

    await waitFor(() => {
      userEvent.type(replicatorFactorInput, '5');
    });

    userEvent.click(replicatorFactorInputSubmitBtn);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    rerender(
      <DangerZone
        defaultPartitions={defaultPartitions}
        defaultReplicationFactor={defaultReplicationFactor}
        partitionsCountIncreased={false}
        replicationFactorUpdated
        updateTopicPartitionsCount={jest.fn()}
        updateTopicReplicationFactor={jest.fn()}
      />
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    );
  });

  it('should close the partitions dialog if he cancel button is pressed', async () => {
    renderComponent();

    const partitionInput = screen.getByPlaceholderText('Number of partitions');
    const partitionInputSubmitBtn = screen.getAllByText(/submit/i)[0];

    await act(() => {
      userEvent.type(partitionInput, '5');
      userEvent.click(partitionInputSubmitBtn);
    });

    await checkDialogThenPressCancel();
  });

  it('should close the replicator dialog if he cancel button is pressed', async () => {
    renderComponent();
    const replicatorFactorInput =
      screen.getByPlaceholderText('Replication Factor');
    const replicatorFactorInputSubmitBtn = screen.getAllByText(/submit/i)[1];

    await act(() => {
      userEvent.type(replicatorFactorInput, '5');
      userEvent.click(replicatorFactorInputSubmitBtn);
    });

    await checkDialogThenPressCancel();
  });
});
