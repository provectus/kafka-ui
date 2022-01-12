import React from 'react';
import { shallow } from 'enzyme';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import Overview from 'components/Topics/Topic/Details/Overview/Overview';
import { Colors } from 'theme/theme';

describe('Overview', () => {
  const mockInternal = false;
  const mockClusterName = 'local';
  const mockTopicName = 'topic';
  const mockUnderReplicatedPartitions = 1;
  const mockInSyncReplicas = 1;
  const mockReplicas = 0;
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
  const renderComponent = () =>
    render(
      <Overview
        name={mockTopicName}
        partitions={mockPartitions}
        internal={mockInternal}
        clusterName={mockClusterName}
        topicName={mockTopicName}
        clearTopicMessages={mockClearTopicMessages}
        underReplicatedPartitions={mockUnderReplicatedPartitions}
        inSyncReplicas={mockInSyncReplicas}
        replicas={mockReplicas}
      />
    );

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

    it('does not render Partitions', () => {
      const componentEmpty = shallow(
        <Overview
          name={mockTopicName}
          partitions={[]}
          internal={mockInternal}
          clusterName={mockClusterName}
          topicName={mockTopicName}
          clearTopicMessages={mockClearTopicMessages}
        />
      );

      expect(componentEmpty.find('td').text()).toEqual('No Partitions found');
    });
  });

  describe('should render circular alert', () => {
    it('should be in document', () => {
      renderComponent();
      const circles = screen.getAllByRole('circle');
      expect(circles[0]).toBeInTheDocument();
      expect(circles[1]).toBeInTheDocument();
      expect(circles.length).toEqual(2);
    });

    it('should be the appropriate color', () => {
      renderComponent();
      const circles = screen.getAllByRole('circle');
      expect(circles[0]).toHaveStyle(`fill: ${Colors.green[40]}`);
      expect(circles[1]).toHaveStyle(`fill: ${Colors.red[50]}`);
    });
  });
});
