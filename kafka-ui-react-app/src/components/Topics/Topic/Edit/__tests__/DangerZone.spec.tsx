import React from 'react';
import DangerZone, {
  Props,
} from 'components/Topics/Topic/Edit/DangerZone/DangerZone';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

const setupWrapper = (props?: Partial<Props>) => (
  <DangerZone
    clusterName="testCluster"
    topicName="testTopic"
    defaultPartitions={3}
    defaultReplicationFactor={3}
    partitionsCountIncreased={false}
    replicationFactorUpdated={false}
    updateTopicPartitionsCount={jest.fn()}
    updateTopicReplicationFactor={jest.fn()}
    {...props}
  />
);

describe('DangerZone', () => {
  it('is rendered properly', () => {
    const component = render(setupWrapper());
    expect(component.baseElement).toMatchSnapshot();
  });

  it('calls updateTopicPartitionsCount', async () => {
    const mockUpdateTopicPartitionsCount = jest.fn();
    render(
      setupWrapper({
        updateTopicPartitionsCount: mockUpdateTopicPartitionsCount,
      })
    );

    userEvent.type(screen.getByLabelText('Number of partitions *'), '4');
    userEvent.click(screen.getByTestId('partitionsSubmit'));

    await waitFor(() => {
      userEvent.click(screen.getAllByText('Submit')[1]);
      expect(mockUpdateTopicPartitionsCount).toHaveBeenCalledTimes(1);
    });
  });

  it('calls updateTopicReplicationFactor', async () => {
    const mockUpdateTopicReplicationFactor = jest.fn();
    render(
      setupWrapper({
        updateTopicReplicationFactor: mockUpdateTopicReplicationFactor,
      })
    );

    userEvent.type(screen.getByLabelText('Replication Factor *'), '4');
    userEvent.click(screen.getByTestId('replicationFactorSubmit'));
    await waitFor(() => {
      userEvent.click(screen.getAllByText('Submit')[2]);
    });

    await waitFor(() => {
      expect(mockUpdateTopicReplicationFactor).toHaveBeenCalledTimes(1);
    });
  });
});
