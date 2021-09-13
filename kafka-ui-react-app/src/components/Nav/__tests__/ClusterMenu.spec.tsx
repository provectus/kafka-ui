import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
import { onlineClusterPayload } from 'redux/reducers/clusters/__test__/fixtures';
import ClusterMenu from 'components/Nav/ClusterMenu';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

describe('ClusterMenu', () => {
  const setupComponent = (cluster: Cluster) => (
    <ThemeProvider theme={theme}>
      <StaticRouter>
        <ClusterMenu cluster={cluster} />
      </StaticRouter>
    </ThemeProvider>
  );

  it('renders cluster menu without Kafka Connect & Schema Registry', () => {
    const wrapper = mount(setupComponent(onlineClusterPayload));
    expect(wrapper.find('ul.menu-list > li > NavLink').text()).toEqual(
      onlineClusterPayload.name
    );

    expect(wrapper.find('ul.menu-list ul StyledMenuItem').length).toEqual(3);
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
    expect(wrapper.find('ul.menu-list ul StyledMenuItem').length).toEqual(5);
  });
});
