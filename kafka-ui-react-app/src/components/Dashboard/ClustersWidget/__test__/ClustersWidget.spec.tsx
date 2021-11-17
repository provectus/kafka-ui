import React from 'react';
import { StaticRouter } from 'react-router';
import { ThemeProvider } from 'styled-components';
import { render, screen, fireEvent } from '@testing-library/react';
import theme from 'theme/theme';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';

import { offlineCluster, onlineCluster, clusters } from './fixtures';

const setupComponent = () =>
  render(
    <ThemeProvider theme={theme}>
      <StaticRouter>
        <ClustersWidget
          clusters={clusters}
          onlineClusters={[onlineCluster]}
          offlineClusters={[offlineCluster]}
        />
      </StaticRouter>
    </ThemeProvider>
  );

describe('ClustersWidget', () => {
  beforeEach(() => setupComponent());

  it('renders clusterWidget list', () => {
    expect(screen.getAllByRole('row').length).toBe(3);
  });

  it('hides online cluster widgets', () => {
    expect(screen.getAllByRole('row').length).toBe(3);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getAllByRole('row').length).toBe(2);
  });
});
