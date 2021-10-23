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
  it('renders clusterWidget list', () => {
    const clusterWidget = component().find('tr');
    expect(clusterWidget.length).toBe(3);
  });

  it('hides online cluster widgets', () => {
    const value = component();
    const input = value.find('input');
    expect(value.find('tr').length).toBe(3);
    input.simulate('change', { target: { checked: true } });
    expect(value.find('tr').length).toBe(2);
  });
});
