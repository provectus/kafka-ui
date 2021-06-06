import React from 'react';
import { shallow } from 'enzyme';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';

import { offlineCluster, onlineCluster, clusters } from './fixtures';

const component = () =>
  shallow(
    <ClustersWidget
      clusters={clusters}
      onlineClusters={[onlineCluster]}
      offlineClusters={[offlineCluster]}
    />
  );

describe('ClustersWidget', () => {
  it('render list length can be 2', () => {
    const wrapper = component().find('ClusterWidget');
    expect(wrapper.length).toBe(2);
  });
});
