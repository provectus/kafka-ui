import React from 'react';
import { mount } from 'enzyme';
import Settings from 'components/Topics/Topic/Details/Settings/Settings';

const wrapper = mount(
  <Settings
    clusterName="cluster"
    topicName="topic"
    isFetched
    fetchTopicConfig={jest.fn()}
    config={[
      {
        defaultValue: 'producer',
        name: 'compression.type',
        value: 'producer',
      },
      {
        defaultValue: 'true',
        name: 'message.downconversion.enable',
        value: 'true',
      },
    ]}
  />
);

describe('Settings', () => {
  it('renders Settings', () => {
    expect(wrapper.find('.box')).toBeTruthy();
    expect(wrapper.find('ConfigListItem')).toHaveLength(2);
  });
});
