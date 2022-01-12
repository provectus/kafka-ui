import React from 'react';
import { shallow } from 'enzyme';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import Overview from 'components/Topics/Topic/Details/Overview/Overview';
import theme from 'theme/theme';

describe('Overview', () => {
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

  const renderComponent = ({
    underReplicatedPartitions = 1,
    inSyncReplicas = 1,
    replicas = 1,
  } = {}) =>
    render(
      <Overview
        name={mockTopicName}
        partitions={mockPartitions}
        internal={undefined}
        clusterName={mockClusterName}
        topicName={mockTopicName}
        clearTopicMessages={mockClearTopicMessages}
        underReplicatedPartitions={underReplicatedPartitions}
        inSyncReplicas={inSyncReplicas}
        replicas={replicas}
      />
    );

  describe('when it has internal flag', () => {
    it('does not render the Action button a Topic', () => {
      const component = shallow(
        <Overview
          name={mockTopicName}
          partitions={mockPartitions}
          internal={false}
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
          internal
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
      expect(circles.length).toEqual(2);
    });

    it('should be the appropriate color', () => {
      renderComponent({
        underReplicatedPartitions: 0,
        inSyncReplicas: 1,
        replicas: 2,
      });
      const circles = screen.getAllByRole('circle');
      expect(circles[0]).toHaveStyle(
        `fill: ${theme.circularAlert.color.error}`
      );
      expect(circles[1]).toHaveStyle(
        `fill: ${theme.circularAlert.color.error}`
      );
    });
  });
});
