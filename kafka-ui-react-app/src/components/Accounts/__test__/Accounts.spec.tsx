import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import { accountsPath } from 'lib/paths';
import Accounts from 'components/Accounts/Accounts';
import { useAccounts, useDeleteAccountMutation } from 'lib/hooks/api/accounts';
import { accountsPayload } from 'lib/fixtures/accounts';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

jest.mock('lib/hooks/api/accounts', () => ({
  useAccounts: jest.fn(),
  useDeleteAccountMutation: jest.fn(),
}));

describe('Accounts Component', () => {
  const renderComponent = () =>
    render(
      <WithRoute path={accountsPath}>
        <Accounts />
      </WithRoute>,
      { initialEntries: [accountsPath] }
    );

  beforeEach(() => {
    (useAccounts as jest.Mock).mockImplementation(() => ({
      data: accountsPayload,
      isSuccess: true,
    }));
    (useDeleteAccountMutation as jest.Mock).mockImplementation(() => ({
      mutateAsync: jest.fn(),
    }));
  });

  it('renders the accounts table', () => {
    renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('viewer')).toBeInTheDocument();
  });

  it('renders the create account button', () => {
    renderComponent();
    expect(
      screen.getByRole('link', { name: 'Create Account' })
    ).toBeInTheDocument();
  });
});
