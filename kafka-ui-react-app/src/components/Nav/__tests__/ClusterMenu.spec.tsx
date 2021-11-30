import React from 'react';
import { StaticRouter } from 'react-router';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
import { onlineClusterPayload } from 'redux/reducers/clusters/__test__/fixtures';
import ClusterMenu from 'components/Nav/ClusterMenu';
import { mountWithTheme } from 'lib/testHelpers';

describe('ClusterMenu', () => {
  const setupComponent = (cluster: Cluster) => (
    <StaticRouter>
      <ClusterMenu cluster={cluster} />
    </StaticRouter>
  );

  it('renders cluster menu without Kafka Connect & Schema Registry', () => {
    const wrapper = mountWithTheme(setupComponent(onlineClusterPayload));
    expect(wrapper.find('ClusterTab').text()).toEqual(
      onlineClusterPayload.name
    );

    expect(wrapper.find('ul ul li').length).toEqual(3);
  });

  it('renders cluster menu with all enabled features', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        ...onlineClusterPayload,
        features: [
          ClusterFeaturesEnum.KAFKA_CONNECT,
          ClusterFeaturesEnum.SCHEMA_REGISTRY,
        ],
      })
    );
    expect(wrapper.find('ul ul li').length).toEqual(5);
  });
});
