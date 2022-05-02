import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import Overview, {
  Props as OverviewProps,
} from 'components/Topics/Topic/Details/Overview/Overview';
import theme from 'theme/theme';
import { CleanUpPolicy } from 'generated-sources';
import ClusterContext from 'components/contexts/ClusterContext';
import userEvent from '@testing-library/user-event';

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
  const defaultContextValues = {
    isReadOnly: false,
    hasKafkaConnectConfigured: true,
    hasSchemaRegistryConfigured: true,
    isTopicDeletionAllowed: true,
  };
  const defaultProps: OverviewProps = {
    name: mockTopicName,
    partitions: [],
    internal: true,
    clusterName: mockClusterName,
    topicName: mockTopicName,
    clearTopicMessages: mockClearTopicMessages,
  };

  const setupComponent = (
    props = defaultProps,
    contextValues = defaultContextValues,
    underReplicatedPartitions?: number,
    inSyncReplicas?: number,
    replicas?: number
  ) =>
    render(
      <ClusterContext.Provider value={contextValues}>
        <Overview
          underReplicatedPartitions={underReplicatedPartitions}
          inSyncReplicas={inSyncReplicas}
          replicas={replicas}
          {...props}
        />
      </ClusterContext.Provider>
    );

  describe('when it has internal flag', () => {
    it('does not render the Action button a Topic', () => {
      setupComponent({
        ...defaultProps,
        partitions: mockPartitions,
        internal: false,
        cleanUpPolicy: CleanUpPolicy.DELETE,
      });
      expect(screen.getAllByRole('menu')[0]).toBeInTheDocument();
    });

    it('does not render Partitions', () => {
      setupComponent();

      expect(screen.getByText('No Partitions found')).toBeInTheDocument();
    });
  });

  describe('should render circular alert', () => {
    it('should be in document', () => {
      setupComponent();
      const circles = screen.getAllByRole('circle');
      expect(circles.length).toEqual(2);
    });

    it('should be the appropriate color', () => {
      setupComponent({
        ...defaultProps,
        underReplicatedPartitions: 0,
        inSyncReplicas: 1,
        replicas: 2,
      });
      const circles = screen.getAllByRole('circle');
      expect(circles[0]).toHaveStyle(
        `fill: ${theme.circularAlert.color.success}`
      );
      expect(circles[1]).toHaveStyle(
        `fill: ${theme.circularAlert.color.error}`
      );
    });
  });

  describe('when Clear Messages is clicked', () => {
    setupComponent({
      ...defaultProps,
      partitions: mockPartitions,
      internal: false,
      cleanUpPolicy: CleanUpPolicy.DELETE,
    });

    const clearMessagesButton = screen.getByText('Clear Messages');
    userEvent.click(clearMessagesButton);

    expect(mockClearTopicMessages).toHaveBeenCalledTimes(1);
  });
});
