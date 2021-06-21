import React from 'react';
import { shallow } from 'enzyme';
import ConsumerGroups from 'components/Topics/Topic/Details/ConsumerGroups/TopicConsumerGroups';

describe('Details', () => {
  const mockFn = jest.fn();
  const mockClusterName = 'local';
  const mockTopicName = 'local';
  const mockWithConsumerGroup = [
    {
      clusterId: '1',
      consumerGroupId: '1',
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
