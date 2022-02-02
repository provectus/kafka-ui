import React from 'react';
import { mount } from 'enzyme';
import { containerRendersView } from 'lib/testHelpers';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';
import ClustersWidgetContainer from 'components/Dashboard/ClustersWidget/ClustersWidgetContainer';
import theme from 'theme/theme';
import { ThemeProvider } from 'styled-components';

describe('ClustersWidgetContainer', () => {
  containerRendersView(<ClustersWidgetContainer />, ClustersWidget);
  describe('view empty ClusterWidget', () => {
    const setupEmptyWrapper = () => (
      <ThemeProvider theme={theme}>
        <ClustersWidget
          clusters={[]}
          onlineClusters={[]}
          offlineClusters={[]}
        />
      </ThemeProvider>
    );
    it(' is empty when no online clusters', () => {
      const wrapper = mount(setupEmptyWrapper());
      expect(wrapper.find('[data-testid="onlineCount"]').text()).toBe('0');
    });
  });
});
