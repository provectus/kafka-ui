import React from 'react';
import Dashboard from 'components/Dashboard/Dashboard';
import { render } from 'lib/testHelpers';

const component = render(<Dashboard />);

describe('Dashboard', () => {
  it('renders ClustersWidget', () => {
    expect(component.queryAllByText('clusters').length).toBeTruthy();
  });
});
