import React from 'react';
import { screen } from '@testing-library/react';
import App from 'components/App';
import { render } from 'lib/testHelpers';
import { useTimeFormat } from 'lib/hooks/api/timeFormat';
import { defaultGlobalSettingsValue } from 'components/contexts/GlobalSettingsContext';
import { useRoleBasedAccessMock } from 'lib/hooks/api/roles';

jest.mock('components/Nav/Nav', () => () => <div>Navigation</div>);

jest.mock('components/Version/Version', () => () => <div>Version</div>);

jest.mock('lib/hooks/api/timeFormat', () => ({
  ...jest.requireActual('lib/hooks/api/timeFormat'),
  useTimeFormat: jest.fn(),
}));

jest.mock('lib/hooks/api/roles', () => ({
  ...jest.requireActual('lib/hooks/api/roles'),
  useRoleBasedAccessMock: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    (useTimeFormat as jest.Mock).mockImplementation(() => ({
      data: defaultGlobalSettingsValue,
    }));

    (useRoleBasedAccessMock as jest.Mock).mockImplementation(() => ({
      data: [],
    }));

    render(<App />, {
      initialEntries: ['/'],
    });
  });

  it('Renders navigation', async () => {
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});
