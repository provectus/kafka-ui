import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import UserInfo from 'components/NavBar/UserInfo/UserInfo';
import { useUserInfo } from 'lib/hooks/api/roles';
import userEvent from '@testing-library/user-event';

jest.mock('lib/hooks/api/roles', () => ({
  useUserInfo: jest.fn(),
}));

describe('UserInfo', () => {
  const renderComponent = () => render(<UserInfo />);

  it('should render the userInfo with correct data', () => {
    const username = 'someName';
    (useUserInfo as jest.Mock).mockImplementation(() => ({
      data: { username },
    }));

    renderComponent();
    expect(screen.getByText(username)).toBeInTheDocument();
  });

  it('should render the userInfo during click opens the dropdown', async () => {
    const username = 'someName';
    (useUserInfo as jest.Mock).mockImplementation(() => ({
      data: { username },
    }));

    renderComponent();
    const dropdown = screen.getByText(username);
    await userEvent.click(dropdown);

    const logout = screen.getByText('Log out');
    expect(logout).toBeInTheDocument();
    expect(logout).toHaveAttribute('href', '/logout');
  });
});
