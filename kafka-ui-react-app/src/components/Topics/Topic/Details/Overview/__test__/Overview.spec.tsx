import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import Overview, {
  Props as OverviewProps,
} from 'components/Topics/Topic/Details/Overview/Overview';
import theme from 'theme/theme';
import { CleanUpPolicy } from 'generated-sources';

describe('Overview', () => {
  const mockClusterName = 'local';
  const mockTopicName = 'topic';
  const mockClearTopicMessages = jest.fn();
  const mockPartitions = [
    {
      partition: 1,
      leader: 1,
      replicas: [
        {
          broker: 1,
          leader: false,
          inSync: true,
        },
      ],
      offsetMax: 0,
      offsetMin: 0,
    },
  ];

  const setupComponent = (
    props: OverviewProps,
    underReplicatedPartitions?: number,
    inSyncReplicas?: number,
    replicas?: number
  ) =>
    render(
      <Overview
        underReplicatedPartitions={underReplicatedPartitions}
        inSyncReplicas={inSyncReplicas}
        replicas={replicas}
        {...props}
      />
    );

  describe('when it has internal flag', () => {
    it('does not render the Action button a Topic', () => {
      setupComponent({
        name: mockTopicName,
        partitions: mockPartitions,
        internal: false,
        clusterName: mockClusterName,
        topicName: mockTopicName,
        cleanUpPolicy: CleanUpPolicy.DELETE,
        clearTopicMessages: mockClearTopicMessages,
      });
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('does not render Partitions', () => {
      setupComponent({
        name: mockTopicName,
        partitions: [],
        internal: true,
        clusterName: mockClusterName,
        topicName: mockTopicName,
        clearTopicMessages: mockClearTopicMessages,
      });

      expect(screen.getByText('No Partitions found')).toBeInTheDocument();
    });
  });

  describe('should render circular alert', () => {
    it('should be in document', () => {
      setupComponent({
        name: mockTopicName,
        partitions: [],
        internal: true,
        clusterName: mockClusterName,
        topicName: mockTopicName,
        clearTopicMessages: mockClearTopicMessages,
      });
      const circles = screen.getAllByRole('circle');
      expect(circles.length).toEqual(2);
    });

    it('should be the appropriate color', () => {
      setupComponent({
        name: mockTopicName,
        partitions: [],
        internal: true,
        clusterName: mockClusterName,
        topicName: mockTopicName,
        clearTopicMessages: mockClearTopicMessages,
        underReplicatedPartitions: 0,
        inSyncReplicas: 1,
        replicas: 2,
      });
      const circles = screen.getAllByRole('circle');
      expect(circles[0]).toHaveStyle(
        `fill: ${theme.circularAlert.color.error}`
      );
      expect(circles[1]).toHaveStyle(
        `fill: ${theme.circularAlert.color.error}`
      );
    });
  });
});
