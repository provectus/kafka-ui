import React from 'react';
import { screen } from '@testing-library/react';
import App from 'components/App';
import { render } from 'lib/testHelpers';
import { useGetUserInfo } from 'lib/hooks/api/roles';
import { useAppInfo } from 'lib/hooks/api/appConfig';

jest.mock('components/Nav/Nav', () => () => <div>Navigation</div>);

jest.mock('components/Version/Version', () => () => <div>Version</div>);

jest.mock('components/NavBar/NavBar', () => () => <div>NavBar</div>);

jest.mock('lib/hooks/api/roles', () => ({
  useGetUserInfo: jest.fn(),
}));
jest.mock('lib/hooks/api/appConfig', () => ({
  useAppInfo: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    (useGetUserInfo as jest.Mock).mockImplementation(() => ({
      data: {},
    }));
    (useAppInfo as jest.Mock).mockImplementation(() => ({
      data: {},
    }));

    render(<App />, {
      initialEntries: ['/'],
    });
  });

  it('Renders navigation', async () => {
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('Renders NavBar', async () => {
    expect(screen.getByText('NavBar')).toBeInTheDocument();
  });
});
