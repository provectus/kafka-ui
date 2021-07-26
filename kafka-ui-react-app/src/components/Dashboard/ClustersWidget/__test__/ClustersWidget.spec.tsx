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
    const clusterWidget = component().find('ClusterWidget');
    expect(clusterWidget.length).toBe(2);
  });

  it('renders ClusterWidget', () => {
    expect(component().exists('ClusterWidget')).toBeTruthy();
  });

  it('renders columns', () => {
    expect(component().exists('.columns')).toBeTruthy();
  });

  it('hides online cluster widgets', () => {
    const value = component();
    const input = value.find('input');
    expect(value.find('ClusterWidget').length).toBe(2);
    input.simulate('change', { target: { checked: true } });
    expect(value.find('ClusterWidget').length).toBe(1);
  });
});
