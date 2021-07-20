import React from 'react';
import { shallow } from 'enzyme';
import ListItem from 'components/ConsumerGroups/List/ListItem';

describe('List', () => {
  const mockConsumerGroup = {
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
  };
  const component = shallow(<ListItem consumerGroup={mockConsumerGroup} />);

  it('render empty ListItem', () => {
    expect(component.exists('.is-clickable')).toBeTruthy();
  });
});
