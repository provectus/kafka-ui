import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import UserInfo from 'components/NavBar/UserInfo/UserInfo';
import { useUserInfo } from 'lib/hooks/useUserInfo';
import userEvent from '@testing-library/user-event';

jest.mock('lib/hooks/useUserInfo', () => ({
  useUserInfo: jest.fn(),
}));

describe('UserInfo', () => {
  const renderComponent = () => render(<UserInfo />);

  it('should render the userInfo with correct data', () => {
    const username = 'someName';
    (useUserInfo as jest.Mock).mockImplementation(() => ({ username }));

    renderComponent();
    expect(screen.getByText(username)).toBeInTheDocument();
  });

  it('should render the userInfo during click opens the dropdown', async () => {
    const username = 'someName';
    Object.defineProperty(window, 'basePath', {
      value: '',
      writable: true,
    });
    (useUserInfo as jest.Mock).mockImplementation(() => ({ username }));

    renderComponent();
    const dropdown = screen.getByText(username);
    await userEvent.click(dropdown);

    const logout = screen.getByText('Log out');
    expect(logout).toBeInTheDocument();
  });

  it('should render correct url during basePath initialization', async () => {
    const username = 'someName';
    const baseUrl = '/path';
    Object.defineProperty(window, 'basePath', {
      value: baseUrl,
      writable: true,
    });
    (useUserInfo as jest.Mock).mockImplementation(() => ({ username }));

    renderComponent();

    const logout = screen.getByText('Log out');
    expect(logout).toBeInTheDocument();
  });

  it('should not render anything if the username does not exists', () => {
    (useUserInfo as jest.Mock).mockImplementation(() => ({
      username: undefined,
    }));

    renderComponent();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should render the role names with correct data', () => {
    const map = new Map();
    map.set(
      'someCluster',
      new Map([
        ['CONFIG', [{ roleName: 'someRole1' }, { roleName: 'someRole2' }]],
      ])
    );

    (useUserInfo as jest.Mock).mockImplementation(() => ({
      username: 'someName',
      roles: map,
    }));

    renderComponent();

    expect(screen.getByText('someName')).toBeInTheDocument();
    expect(screen.getByText('Assigned roles')).toBeInTheDocument();
    expect(screen.getByText('someRole1')).toBeInTheDocument();
    expect(screen.getByText('someRole2')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });
});
