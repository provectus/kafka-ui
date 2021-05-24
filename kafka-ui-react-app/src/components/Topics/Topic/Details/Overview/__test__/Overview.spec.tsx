import React from 'react';
import { shallow } from 'enzyme';
import Overview from 'components/Topics/Topic/Details/Overview/Overview';

describe('Overview', () => {
  const mockInternal = false;
  const mockClusterName = 'local';
  const mockTopicName = 'topic';
  const mockClearTopicMessages = jest.fn();
  const mockPartitions = [
    {
      partition: 1,
      leader: 1,
      replicas: [
        {
          broker: 1,
          leader: false,
          inSync: true,
        },
      ],
      offsetMax: 0,
      offsetMin: 0,
    },
  ];

  describe('when it has internal flag', () => {
    it('does not render the Action button a Topic', () => {
      const component = shallow(
        <Overview
          name={mockTopicName}
          partitions={mockPartitions}
          internal={mockInternal}
          clusterName={mockClusterName}
          topicName={mockTopicName}
          clearTopicMessages={mockClearTopicMessages}
        />
      );

      expect(component.exists('Dropdown')).toBeTruthy();
    });
  });
});
