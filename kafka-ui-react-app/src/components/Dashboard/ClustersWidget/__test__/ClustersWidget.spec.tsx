import React from 'react';
import { StaticRouter } from 'react-router';
import { screen } from '@testing-library/react';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

import { offlineCluster, onlineCluster, clusters } from './fixtures';

const setupComponent = () =>
  render(
    <StaticRouter>
      <ClustersWidget
        clusters={clusters}
        onlineClusters={[onlineCluster]}
        offlineClusters={[offlineCluster]}
      />
    </StaticRouter>
  );

describe('ClustersWidget', () => {
  beforeEach(() => setupComponent());

  it('renders clusterWidget list', () => {
    expect(screen.getAllByRole('row').length).toBe(3);
  });

  it('hides online cluster widgets', () => {
    expect(screen.getAllByRole('row').length).toBe(3);
    userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getAllByRole('row').length).toBe(2);
  });
});
