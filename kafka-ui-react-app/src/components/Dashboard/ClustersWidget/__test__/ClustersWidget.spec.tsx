import React from 'react';
import { act, screen } from '@testing-library/react';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { useClusters } from 'lib/hooks/api/clusters';
import { clustersPayload } from 'lib/fixtures/clusters';

jest.mock('lib/hooks/api/clusters', () => ({
  useClusters: jest.fn(),
}));

describe('ClustersWidget', () => {
  beforeEach(async () => {
    (useClusters as jest.Mock).mockImplementation(() => ({
      data: clustersPayload,
      isSuccess: true,
    }));
    await act(() => {
      render(<ClustersWidget />);
    });
  });

  it('renders clusterWidget list', () => {
    expect(screen.getAllByRole('row').length).toBe(3);
  });

  it('hides online cluster widgets', () => {
    expect(screen.getAllByRole('row').length).toBe(3);
    userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getAllByRole('row').length).toBe(2);
  });

  it('when cluster is read-only', () => {
    expect(screen.getByText('readonly')).toBeInTheDocument();
  });

  it('render clusterWidget cells', () => {
    const cells = screen.getAllByRole('cells');
    expect(cells.length).toBe(14);
    expect(cells[0]).toHaveStyle('max-width: 99px');
  });
});
