import React from 'react';
import DangerZone, {
  Props,
} from 'components/Topics/Topic/Edit/DangerZone/DangerZone';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

import { topicName, clusterName } from './fixtures';

const renderComponent = (props?: Partial<Props>) =>
  render(
    <DangerZone
      clusterName={clusterName}
      topicName={topicName}
      defaultPartitions={3}
      defaultReplicationFactor={3}
      partitionsCountIncreased={false}
      replicationFactorUpdated={false}
      updateTopicPartitionsCount={jest.fn()}
      updateTopicReplicationFactor={jest.fn()}
      {...props}
    />
  );

const clickOnDialogSubmitButton = () => {
  userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', {
      name: 'Submit',
    })
  );
};
describe('DangerZone', () => {
  it('renders', () => {
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
});
