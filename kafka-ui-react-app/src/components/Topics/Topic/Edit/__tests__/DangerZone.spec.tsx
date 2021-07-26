import React from 'react';
import DangerZone, { Props } from 'components/Topics/Topic/Edit/DangerZone';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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
    const component = render(
      setupWrapper({
        updateTopicPartitionsCount: mockUpdateTopicPartitionsCount,
      })
    );

    const input = screen.getByLabelText('Number of partitions *');
    fireEvent.input(input, {
      target: {
        value: 4,
      },
    });
    fireEvent.submit(screen.getByTestId('partitionsSubmit'));
    await waitFor(() => {
      expect(component.baseElement).toMatchSnapshot();
      fireEvent.click(screen.getByText('Confirm'));
      expect(mockUpdateTopicPartitionsCount).toHaveBeenCalledTimes(1);
    });
  });

  it('calls updateTopicReplicationFactor', async () => {
    const mockUpdateTopicReplicationFactor = jest.fn();
    const component = render(
      setupWrapper({
        updateTopicReplicationFactor: mockUpdateTopicReplicationFactor,
      })
    );

    const input = screen.getByLabelText('Replication Factor *');
    fireEvent.input(input, {
      target: {
        value: 4,
      },
    });
    fireEvent.submit(screen.getByTestId('replicationFactorSubmit'));
    await waitFor(() => {
      expect(component.baseElement).toMatchSnapshot();
      fireEvent.click(screen.getByText('Confirm'));
      expect(mockUpdateTopicReplicationFactor).toHaveBeenCalledTimes(1);
    });
  });
});
