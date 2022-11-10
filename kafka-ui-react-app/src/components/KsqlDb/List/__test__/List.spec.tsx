import React from 'react';
import List from 'components/KsqlDb/List/List';
import { render } from 'lib/testHelpers';
import fetchMock from 'fetch-mock';
import { screen } from '@testing-library/dom';
import { act } from '@testing-library/react';
import { usePermission } from 'lib/hooks/usePermission';

jest.mock('lib/hooks/usePermission', () => ({
  usePermission: jest.fn(),
}));

describe('KsqlDb List', () => {
  const renderComponent = async () => {
    await act(() => {
      render(<List />);
    });
  };
  afterEach(() => fetchMock.reset());
  it('renders List component with Tables and Streams tabs', async () => {
    await renderComponent();
    const Tables = screen.getByTitle('Tables');
    const Streams = screen.getByTitle('Streams');
    expect(Tables).toBeInTheDocument();
    expect(Streams).toBeInTheDocument();
  });

  describe('Permissions', () => {
    it('checks the Execute KsqlDb query button is disable when there is not permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => false);
      await renderComponent();
      expect(screen.getByText(/Execute KSQL Request/i)).toBeDisabled();
    });

    it('checks the Execute KsqlDb query button is enable when there is permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => true);
      await renderComponent();
      expect(screen.getByText(/Execute KSQL Request/i)).toBeEnabled();
    });
  });
});
