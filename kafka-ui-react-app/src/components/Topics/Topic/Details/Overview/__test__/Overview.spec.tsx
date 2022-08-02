import React from 'react';
import { screen } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import Overview, {
  Props as OverviewProps,
} from 'components/Topics/Topic/Details/Overview/Overview';
import theme from 'theme/theme';
import { CleanUpPolicy, Topic } from 'generated-sources';
import ClusterContext from 'components/contexts/ClusterContext';
import userEvent from '@testing-library/user-event';
import { getTopicStateFixtures } from 'redux/reducers/topics/__test__/fixtures';
import { clusterTopicPath } from 'lib/paths';
import { Replica } from 'components/Topics/Topic/Details/Overview/Overview.styled';

describe('Overview', () => {
  const mockClusterName = 'local';
  const mockTopicName = 'topic';
  const mockTopic = { name: mockTopicName };

  const mockPartitions = [
    {
      partition: 1,
      leader: 1,
      replicas: [
        {
          broker: 1,
          leader: true,
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

  const setupComponent = (
    props: Partial<OverviewProps> = {},
    topicState: Topic = mockTopic,
    contextValues = defaultContextValues
  ) => {
    const topics = getTopicStateFixtures([topicState]);

    return render(
      <WithRoute path={clusterTopicPath()}>
        <ClusterContext.Provider value={contextValues}>
          <Overview clearTopicMessages={jest.fn()} {...props} />
        </ClusterContext.Provider>
      </WithRoute>,
      {
        initialEntries: [clusterTopicPath(mockClusterName, mockTopicName)],
        preloadedState: { topics },
      }
    );
  };

  it('at least one replica was rendered', () => {
    setupComponent(
      {},
      {
        ...mockTopic,
        partitions: mockPartitions,
        internal: false,
        cleanUpPolicy: CleanUpPolicy.DELETE,
      }
    );
    expect(screen.getByLabelText('replica-info')).toBeInTheDocument();
  });

  it('renders replica cell with props', () => {
    render(<Replica leader />);
    const element = screen.getByLabelText('replica-info');
    expect(element).toBeInTheDocument();
    expect(element).toHaveStyleRule(
      'color',
      theme.topicMetaData.liderReplica.color
    );
  });

  describe('when it has internal flag', () => {
    it('renders the Action button for Topic', () => {
      setupComponent(
        {},
        {
          ...mockTopic,
          partitions: mockPartitions,
          internal: false,
          cleanUpPolicy: CleanUpPolicy.DELETE,
        }
      );
      expect(screen.getAllByLabelText('Dropdown Toggle').length).toEqual(1);
    });

    it('does not render Partitions', () => {
      setupComponent({}, { ...mockTopic, partitions: [] });

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
      setupComponent(
        {},
        {
          ...mockTopic,
          underReplicatedPartitions: 0,
          inSyncReplicas: 1,
          replicas: 2,
        }
      );
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
    it('should when Clear Messages is clicked', () => {
      const mockClearTopicMessages = jest.fn();
      setupComponent(
        { clearTopicMessages: mockClearTopicMessages },
        {
          ...mockTopic,
          partitions: mockPartitions,
          internal: false,
          cleanUpPolicy: CleanUpPolicy.DELETE,
        }
      );

      const clearMessagesButton = screen.getByText('Clear Messages');
      userEvent.click(clearMessagesButton);
      expect(mockClearTopicMessages).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the table partition dropdown appearance', () => {
    it('should check if the dropdown is not present when it is readOnly', () => {
      setupComponent(
        {},
        {
          ...mockTopic,
          partitions: mockPartitions,
          internal: true,
          cleanUpPolicy: CleanUpPolicy.DELETE,
        },
        { ...defaultContextValues, isReadOnly: true }
      );
      expect(screen.queryByText('Clear Messages')).not.toBeInTheDocument();
    });

    it('should check if the dropdown is not present when it is internal', () => {
      setupComponent(
        {},
        {
          ...mockTopic,
          partitions: mockPartitions,
          internal: true,
          cleanUpPolicy: CleanUpPolicy.DELETE,
        }
      );
      expect(screen.queryByText('Clear Messages')).not.toBeInTheDocument();
    });

    it('should check if the dropdown is not present when cleanUpPolicy is not DELETE', () => {
      setupComponent(
        {},
        {
          ...mockTopic,
          partitions: mockPartitions,
          internal: false,
          cleanUpPolicy: CleanUpPolicy.COMPACT,
        }
      );
      expect(screen.queryByText('Clear Messages')).not.toBeInTheDocument();
    });

    it('should check if the dropdown action to be in visible', () => {
      setupComponent(
        {},
        {
          ...mockTopic,
          partitions: mockPartitions,
          internal: false,
          cleanUpPolicy: CleanUpPolicy.DELETE,
        }
      );
      expect(screen.getByText('Clear Messages')).toBeInTheDocument();
    });
  });
});
