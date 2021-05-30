import React from 'react';
import { shallow } from 'enzyme';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';

import { offlineCluster, onlineCluster, clusters } from './fixtures';

describe('Dashboard', () => {
  it('is Dashboard truthy', () => {
    const component = shallow(
      <ClustersWidget
        clusters={clusters}
        onlineClusters={[onlineCluster]}
        offlineClusters={[offlineCluster]}
      />
    );

    expect(component.exists('.title')).toBeTruthy();
  });
});
