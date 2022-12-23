import React from 'react';
import { screen } from '@testing-library/react';
import App from 'components/App';
import { render } from 'lib/testHelpers';
import { useTimeFormat } from 'lib/hooks/api/timeFormat';
import { defaultGlobalSettingsValue } from 'components/contexts/GlobalSettingsContext';
import { useGetUserInfo } from 'lib/hooks/api/roles';

jest.mock('components/Nav/Nav', () => () => <div>Navigation</div>);

jest.mock('components/Version/Version', () => () => <div>Version</div>);

jest.mock('components/NavBar/NavBar', () => () => <div>NavBar</div>);

jest.mock('lib/hooks/api/timeFormat', () => ({
  ...jest.requireActual('lib/hooks/api/timeFormat'),
  useTimeFormat: jest.fn(),
}));

jest.mock('lib/hooks/api/roles', () => ({
  useGetUserInfo: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    (useTimeFormat as jest.Mock).mockImplementation(() => ({
      data: defaultGlobalSettingsValue,
    }));

    (useGetUserInfo as jest.Mock).mockImplementation(() => ({
      data: {},
    }));

    render(<App />, {
      initialEntries: ['/'],
    });
  });

  it('Renders navigation', async () => {
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});
