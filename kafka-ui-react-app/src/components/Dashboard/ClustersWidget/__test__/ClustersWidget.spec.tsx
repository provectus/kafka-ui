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
    expect(component().find('ClusterWidget')).toBeTruthy();
  });

  it('renders columns', () => {
    expect(component().find('.columns')).toBeTruthy();
  });

  it('hides online cluster widgets', () => {
    const input = component().find('input');
    input.simulate('click');
    expect(input.length).toBe(1);
  });
});
