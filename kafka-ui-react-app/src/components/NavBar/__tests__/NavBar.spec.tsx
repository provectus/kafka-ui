import React from 'react';
import { render } from 'lib/testHelpers';
import NavBar from 'components/NavBar/NavBar';
import { screen, within } from '@testing-library/react';

const burgerButtonOptions = { name: 'burger' };
const logoutButtonOptions = { name: 'Log out' };

describe('NavBar', () => {
  beforeEach(() => {
    render(<NavBar onBurgerClick={jest.fn()} />);
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
});
