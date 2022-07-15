import React from 'react';
import { screen, within } from '@testing-library/react';
import App from 'components/App';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';

const burgerButtonOptions = { name: 'burger' };
const logoutButtonOptions = { name: 'Log out' };

jest.mock('components/Nav/Nav', () => () => <div>Navigation</div>);

describe('App', () => {
  beforeEach(() => {
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

  it('handle burger click correctly', () => {
    const burger = within(screen.getByLabelText('Page Header')).getByRole(
      'button',
      burgerButtonOptions
    );
    const overlay = screen.getByLabelText('Overlay');
    expect(screen.getByLabelText('Sidebar')).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyleRule('visibility: hidden');
    expect(burger).toHaveStyleRule('display: none');
    userEvent.click(burger);
    expect(overlay).toHaveStyleRule('visibility: visible');
  });

  it('Renders navigation', async () => {
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});
