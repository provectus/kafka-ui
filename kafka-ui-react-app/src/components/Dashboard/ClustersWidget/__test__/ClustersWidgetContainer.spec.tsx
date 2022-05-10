import React from 'react';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';
import { getByTextContent, render } from 'lib/testHelpers';

describe('ClustersWidgetContainer', () => {
  it('renders ClustersWidget', () => {
    render(
      <ClustersWidget clusters={[]} onlineClusters={[]} offlineClusters={[]} />
    );
    expect(getByTextContent('Online 0 clusters')).toBeInTheDocument();
  });
});
