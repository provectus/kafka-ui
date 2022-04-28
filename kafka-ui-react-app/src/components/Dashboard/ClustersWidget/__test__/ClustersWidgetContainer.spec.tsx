import React from 'react';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';
import ClustersWidgetContainer from 'components/Dashboard/ClustersWidget/ClustersWidgetContainer';
import theme from 'theme/theme';
import { ThemeProvider } from 'styled-components';
import { render, screen } from '@testing-library/react';

describe('ClustersWidgetContainer', () => {
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
      render(setupEmptyWrapper());
      expect(screen.getByTestId('onlineCount')).toHaveTextContent('0');
    });
  });
});
