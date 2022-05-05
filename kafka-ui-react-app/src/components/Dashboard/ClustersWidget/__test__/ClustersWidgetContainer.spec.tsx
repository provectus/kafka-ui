import React from 'react';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';
import theme from 'theme/theme';
import { ThemeProvider } from 'styled-components';
import { render } from '@testing-library/react';
import { getByTextContent } from 'lib/testHelpers';

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
      expect(getByTextContent('Online 0 clusters')).toBeInTheDocument();
    });
  });
});
