import React from 'react';
import DangerZone, {
  Props,
} from 'components/Topics/Topic/Edit/DangerZone/DangerZone';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

const setupWrapper = (props?: Partial<Props>) => (
  <ThemeProvider theme={theme}>
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
  </ThemeProvider>
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

    const input = screen.getByLabelText('Number of partitions *');
    fireEvent.input(input, {
      target: {
        value: 4,
      },
    });
    fireEvent.submit(screen.getByTestId('partitionsSubmit'));
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Submit')[1]);
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

    const input = screen.getByLabelText('Replication Factor *');
    fireEvent.input(input, {
      target: {
        value: 4,
      },
    });
    fireEvent.submit(screen.getByTestId('replicationFactorSubmit'));
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Submit')[2]);
      expect(mockUpdateTopicReplicationFactor).toHaveBeenCalledTimes(1);
    });
  });
});
