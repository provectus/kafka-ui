import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import ConsumerGroups, {
  Props,
} from 'components/Topics/Topic/Details/ConsumerGroups/TopicConsumerGroups';
import { ConsumerGroupState } from 'generated-sources';

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

  const setUpComponent = (props: Partial<Props> = {}) => {
    const { name, topicName, consumerGroups, isFetched } = props;

    return render(
      <ConsumerGroups
        clusterName={mockClusterName}
        consumerGroups={consumerGroups?.length ? consumerGroups : []}
        name={name || mockTopicName}
        fetchTopicConsumerGroups={jest.fn()}
        topicName={topicName || mockTopicName}
        isFetched={'isFetched' in props ? !!isFetched : false}
      />
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
