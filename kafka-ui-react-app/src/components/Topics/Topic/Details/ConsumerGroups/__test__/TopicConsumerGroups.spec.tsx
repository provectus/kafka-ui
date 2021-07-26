import React from 'react';
import { shallow } from 'enzyme';
import ConsumerGroups from 'components/Topics/Topic/Details/ConsumerGroups/TopicConsumerGroups';
import { ConsumerGroupState } from 'generated-sources';

describe('Details', () => {
  const mockFn = jest.fn();
  const mockClusterName = 'local';
  const mockTopicName = 'local';
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

  it("don't render ConsumerGroups in Topic", () => {
    const component = shallow(
      <ConsumerGroups
        clusterName={mockClusterName}
        consumerGroups={[]}
        name={mockTopicName}
        fetchTopicConsumerGroups={mockFn}
        topicName={mockTopicName}
      />
    );
    expect(component.find('td').text()).toEqual('No active consumer groups');
  });

  it('render ConsumerGroups in Topic', () => {
    const component = shallow(
      <ConsumerGroups
        clusterName={mockClusterName}
        consumerGroups={mockWithConsumerGroup}
        name={mockTopicName}
        fetchTopicConsumerGroups={mockFn}
        topicName={mockTopicName}
      />
    );
    expect(component.exists('tbody')).toBeTruthy();
  });
});
