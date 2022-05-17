import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import ConsumerGroups, {
  Props,
} from 'components/Topics/Topic/Details/ConsumerGroups/TopicConsumerGroups';
import { ConsumerGroupState } from 'generated-sources';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { getTopicStateFixtures } from 'redux/reducers/topics/__test__/fixtures';

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

  const topic = {
    name: mockTopicName,
  };

  const topicsState = getTopicStateFixtures([topic], mockWithConsumerGroup);

  const defaultPathName =
    '/ui/clusters/:clusterName/topics/:topicName/consumer-groups';

  const defaultHistory = createMemoryHistory({
    initialEntries: [
      defaultPathName
        .replace(':clusterName', mockClusterName)
        .replace(':topicName', mockTopicName),
    ],
  });

  const setUpComponent = (
    props: Partial<Props> = {},
    history = defaultHistory
  ) => {
    const { name, consumerGroups, isFetched } = props;

    return render(
      <Router history={history}>
        <Route path={defaultPathName}>
          <ConsumerGroups
            consumerGroups={consumerGroups?.length ? consumerGroups : []}
            name={name || mockTopicName}
            fetchTopicConsumerGroups={jest.fn()}
            isFetched={'isFetched' in props ? !!isFetched : false}
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
    setUpComponent({
      consumerGroups: mockWithConsumerGroup,
      isFetched: true,
    });
    expect(screen.getAllByRole('rowgroup')).toHaveLength(2);
  });
});
