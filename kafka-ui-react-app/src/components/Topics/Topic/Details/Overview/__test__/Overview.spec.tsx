import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import Overview, {
  Props as OverviewProps,
} from 'components/Topics/Topic/Details/Overview/Overview';
import theme from 'theme/theme';
import { CleanUpPolicy, Topic } from 'generated-sources';
import ClusterContext from 'components/contexts/ClusterContext';
import userEvent from '@testing-library/user-event';
import { getTopicStateFixtures } from 'redux/reducers/topics/__test__/fixtures';
import { clusterTopicPath } from 'lib/paths';
import { createMemoryHistory } from 'history';
import { Route, Router } from 'react-router-dom';
import { ReplicaCell } from 'components/Topics/Topic/Details/Details.styled';

describe('Overview', () => {
  const mockClusterName = 'local';
  const mockTopicName = 'topic';
  const mockTopic = { name: mockTopicName };

  const defaultPathName = clusterTopicPath(':clusterName', ':topicName');

  const defaultHistory = createMemoryHistory({
    initialEntries: [clusterTopicPath(mockClusterName, mockTopicName)],
  });

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
      <Router history={defaultHistory}>
        <Route path={defaultPathName}>
          <ClusterContext.Provider value={contextValues}>
            <Overview clearTopicMessages={jest.fn()} {...props} />
          </ClusterContext.Provider>
        </Route>
      </Router>,
      { pathname: defaultPathName, preloadedState: { topics } }
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
    render(<ReplicaCell leader />);
    const element = screen.getByLabelText('replica-info');
    expect(element).toBeInTheDocument();
    expect(element).toHaveStyleRule('color', 'orange');
  });

  describe('when it has internal flag', () => {
    it('does not render the Action button a Topic', () => {
      setupComponent(
        {},
        {
          ...mockTopic,
          partitions: mockPartitions,
          internal: false,
          cleanUpPolicy: CleanUpPolicy.DELETE,
        }
      );
      expect(screen.getAllByRole('menu')[0]).toBeInTheDocument();
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
