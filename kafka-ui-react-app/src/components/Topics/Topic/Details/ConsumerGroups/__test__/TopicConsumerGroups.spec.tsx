import React from 'react';
import { shallow } from 'enzyme';
import ConsumerGroups from 'components/Topics/Topic/Details/ConsumerGroups/TopicConsumerGroups';

describe('Details', () => {
  const mockFn = jest.fn();
  const mockClusterName = 'local';
  const mockTopicName = 'local';
  const mockWithConsumerGroup = [
    {
      groupId: 'messages-consumer',
      consumerId:
        'consumer-messages-consumer-1-122fbf98-643b-491d-8aec-c0641d2513d0',
      topic: 'messages',
      host: '/172.31.9.153',
      partition: 6,
      currentOffset: 394,
      endOffset: 394,
      messagesBehind: 0,
    },
    {
      groupId: 'messages-consumer',
      consumerId:
        'consumer-messages-consumer-1-122fbf98-643b-491d-8aec-c0641d2513d0',
      topic: 'messages',
      host: '/172.31.9.153',
      partition: 7,
      currentOffset: 384,
      endOffset: 384,
      messagesBehind: 0,
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

    expect(component.exists('.table')).toBeFalsy();
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

    expect(component.exists('.table')).toBeTruthy();
  });
});
