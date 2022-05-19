import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import TopicConsumerGroups, {
  Props,
} from 'components/Topics/Topic/Details/ConsumerGroups/TopicConsumerGroups';
import { ConsumerGroup, ConsumerGroupState } from 'generated-sources';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { getTopicStateFixtures } from 'redux/reducers/topics/__test__/fixtures';
import { TopicWithDetailedInfo } from 'redux/interfaces';
import { clusterTopicConsumerGroupsPath } from 'lib/paths';

describe('TopicConsumerGroups', () => {
  const mockClusterName = 'localClusterName';
  const mockTopicName = 'localTopicName';
  const mockWithConsumerGroup = [
    {
      groupId: 'amazon.msk.canary.group.broker-7',
      topics: 0,
      members: 0,
      simple: false,
      partitionAssignor: '',
      state: ConsumerGroupState.UNKNOWN,
      coordinator: { id: 1 },
      messagesBehind: 9,
    },
    {
      groupId: 'amazon.msk.canary.group.broker-4',
      topics: 0,
      members: 0,
      simple: false,
      partitionAssignor: '',
      state: ConsumerGroupState.COMPLETING_REBALANCE,
      coordinator: { id: 1 },
      messagesBehind: 9,
    },
  ];

  const defaultPathName = clusterTopicConsumerGroupsPath(
    ':clusterName',
    ':topicName'
  );

  const defaultHistory = createMemoryHistory({
    initialEntries: [
      clusterTopicConsumerGroupsPath(mockClusterName, mockTopicName),
    ],
  });

  const setUpComponent = (
    props: Partial<Props> = {},
    consumerGroups?: ConsumerGroup[]
  ) => {
    const topic: TopicWithDetailedInfo = {
      name: mockTopicName,
      consumerGroups,
    };
    const topicsState = getTopicStateFixtures([topic]);

    return render(
      <Router history={defaultHistory}>
        <Route path={defaultPathName}>
          <TopicConsumerGroups
            fetchTopicConsumerGroups={jest.fn()}
            isFetched={false}
            {...props}
          />
        </Route>
      </Router>,
      {
        pathname: defaultPathName,
        preloadedState: {
          topics: topicsState,
        },
      }
    );
  };

  describe('Default Setup', () => {
    beforeEach(() => {
      setUpComponent();
    });
    it('should view the Page loader when it is fetching state', () => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it("don't render ConsumerGroups in Topic", () => {
    setUpComponent({ isFetched: true });
    expect(screen.getByText(/No active consumer groups/i)).toBeInTheDocument();
  });

  it('render ConsumerGroups in Topic', () => {
    setUpComponent(
      {
        isFetched: true,
      },
      mockWithConsumerGroup
    );
    expect(screen.getAllByRole('rowgroup')).toHaveLength(2);
    expect(
      screen.getByText(mockWithConsumerGroup[0].groupId)
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockWithConsumerGroup[1].groupId)
    ).toBeInTheDocument();
  });
});
