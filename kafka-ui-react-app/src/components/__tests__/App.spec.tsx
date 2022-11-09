import React from 'react';
import { screen, within } from '@testing-library/react';
import App from 'components/App';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { useTimeFormat } from 'lib/hooks/api/timeFormat';
import { defaultGlobalSettingsValue } from 'components/contexts/GlobalSettingsContext';
import { useRoleBasedAccessMock } from 'lib/hooks/api/roles';

const burgerButtonOptions = { name: 'burger' };
const logoutButtonOptions = { name: 'Log out' };

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

  it('correctly renders header', () => {
    const header = screen.getByLabelText('Page Header');
    expect(header).toBeInTheDocument();
    expect(within(header).getByText('UI for Apache Kafka')).toBeInTheDocument();
    expect(within(header).getAllByRole('separator').length).toEqual(3);
    expect(
      within(header).getByRole('button', burgerButtonOptions)
    ).toBeInTheDocument();
    expect(
      within(header).getByRole('button', logoutButtonOptions)
    ).toBeInTheDocument();
  });

  it('handle burger click correctly', async () => {
    const burger = within(screen.getByLabelText('Page Header')).getByRole(
      'button',
      burgerButtonOptions
    );
    const overlay = screen.getByLabelText('Overlay');
    expect(screen.getByLabelText('Sidebar')).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyleRule('visibility: hidden');
    expect(burger).toHaveStyleRule('display: none');
    await userEvent.click(burger);
    expect(overlay).toHaveStyleRule('visibility: visible');
  });

  it('Renders navigation', async () => {
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});
