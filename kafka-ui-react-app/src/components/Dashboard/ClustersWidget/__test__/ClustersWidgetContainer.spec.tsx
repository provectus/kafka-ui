import React from 'react';
import { mount } from 'enzyme';
import { containerRendersView } from 'lib/testHelpers';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';
import ClustersWidgetContainer from 'components/Dashboard/ClustersWidget/ClustersWidgetContainer';

describe('ClustersWidgetContainer', () => {
  containerRendersView(<ClustersWidgetContainer />, ClustersWidget);
  describe('view empty ClusterWidget', () => {
    const setupEmptyWrapper = () => (
      <ClustersWidget clusters={[]} onlineClusters={[]} offlineClusters={[]} />
    );
    it(' is empty when no online clusters', () => {
      const wrapper = mount(setupEmptyWrapper());
      expect(wrapper.find('.is-success').text()).toBe('0');
    });
  });
});
