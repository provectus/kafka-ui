import React from 'react';
import { shallow, mount } from 'enzyme';
import List from 'components/ConsumerGroups/List/List';

describe('List', () => {
  const mockConsumerGroups = [
    {
      groupId: 'groupId',
      members: 0,
      topics: 1,
      simple: false,
      partitionAssignor: '',
      coordinator: {
        id: 1,
        host: 'host',
      },
      partitions: [
        {
          consumerId: null,
          currentOffset: 0,
          endOffset: 0,
          host: null,
          messagesBehind: 0,
          partition: 1,
          topic: 'topic',
        },
      ],
    },
  ];
  const component = shallow(
    <List consumerGroups={mockConsumerGroups} clusterName="cluster" />
  );
  const componentEmpty = mount(
    <List consumerGroups={[]} clusterName="cluster" />
  );

  it('render empty List consumer Groups', () => {
    expect(componentEmpty.find('td').text()).toEqual(
      'No active consumer groups'
    );
  });

  it('render List consumer Groups', () => {
    expect(component.exists('.section')).toBeTruthy();
  });
});
