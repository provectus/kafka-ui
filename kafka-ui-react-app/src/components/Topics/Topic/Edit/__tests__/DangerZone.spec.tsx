import { shallow } from 'enzyme';
import React from 'react';
import DangerZone, { Props } from 'components/Topics/Topic/Edit/DangerZone';

const setupWrapper = (props?: Partial<Props>) => (
  <DangerZone
    clusterName="testCluster"
    topicName="testTopic"
    defaultPartitions={3}
    defaultReplicationFactor={3}
    partitionsCountIncreased={false}
    replicationFactorUpdated={false}
    updateTopicPartitionsCount={jest.fn()}
    updateTopicReplicationFactor={jest.fn()}
    {...props}
  />
);

describe('DangerZone', () => {
  it('is rendered properly', () => {
    const component = shallow(setupWrapper());
    expect(component).toMatchSnapshot();
  });
});
