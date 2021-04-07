import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
import { onlineClusterPayload } from 'redux/reducers/clusters/__test__/fixtures';
import ClusterMenu from '../ClusterMenu';

describe('ClusterMenu', () => {
  const setupComponent = (cluster: Cluster) => (
    <StaticRouter>
      <ClusterMenu cluster={cluster} />
    </StaticRouter>
  );

  it('renders cluster menu without Kafka Connect & Schema Registry', () => {
    const wrapper = mount(setupComponent(onlineClusterPayload));
    expect(wrapper.find('ul.menu-list > li > NavLink').text()).toEqual(
      onlineClusterPayload.name
    );

    expect(wrapper.find('ul.menu-list ul > li').length).toEqual(3);
  });

  it('renders cluster menu with all enabled features', () => {
    const wrapper = mount(
      setupComponent({
        ...onlineClusterPayload,
        features: [
          ClusterFeaturesEnum.KAFKA_CONNECT,
          ClusterFeaturesEnum.SCHEMA_REGISTRY,
        ],
      })
    );
    expect(wrapper.find('ul.menu-list ul > li').length).toEqual(5);
  });
});
