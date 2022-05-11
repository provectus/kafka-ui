import React from 'react';
import Dashboard from 'components/Dashboard/Dashboard';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';

jest.mock(
  'components/Dashboard/ClustersWidget/ClustersWidgetContainer.ts',
  () => () => <div>mock-ClustersWidgetContainer</div>
);

describe('Dashboard', () => {
  it('renders ClustersWidget', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('mock-ClustersWidgetContainer')
    ).toBeInTheDocument();
  });
});
