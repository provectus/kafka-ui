import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import ClustersWidget from 'components/Dashboard/ClustersWidget/ClustersWidget';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import fetchMock from 'fetch-mock';
import { clustersPayload } from 'components/Cluster/__tests__/fixtures';

describe('ClustersWidget', () => {
  afterEach(() => fetchMock.restore());

  beforeEach(async () => {
    const mock = fetchMock.get('/api/clusters', clustersPayload);

    await act(() => {
      render(<ClustersWidget />);
    });
    await waitFor(() => expect(mock.called()).toBeTruthy());
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
