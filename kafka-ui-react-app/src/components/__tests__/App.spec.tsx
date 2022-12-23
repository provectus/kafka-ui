import React from 'react';
import { screen } from '@testing-library/react';
import App from 'components/App';
import { render } from 'lib/testHelpers';
import { useGetUserInfo } from 'lib/hooks/api/roles';

jest.mock('components/Nav/Nav', () => () => <div>Navigation</div>);

jest.mock('components/Version/Version', () => () => <div>Version</div>);

jest.mock('lib/hooks/api/roles', () => ({
  useGetUserInfo: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    (useGetUserInfo as jest.Mock).mockImplementation(() => ({
      data: {},
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
      })),
    });
    render(<App />, {
      initialEntries: ['/'],
    });
  });

  it('Renders navigation', async () => {
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});
