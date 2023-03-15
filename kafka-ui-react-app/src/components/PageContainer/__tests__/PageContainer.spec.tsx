import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import PageContainer from 'components/PageContainer/PageContainer';
import { useClusters } from 'lib/hooks/api/clusters';

const burgerButtonOptions = { name: 'burger' };

jest.mock('lib/hooks/api/clusters', () => ({
  ...jest.requireActual('lib/hooks/api/roles'),
  useClusters: jest.fn(),
}));

jest.mock('components/Version/Version', () => () => <div>Version</div>);

describe('Page Container', () => {
  beforeEach(() => {
    (useClusters as jest.Mock).mockImplementation(() => ({
      isSuccess: false,
    }));
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
      })),
    });

    render(
      <PageContainer setDarkMode={jest.fn()}>
        <div>child</div>
      </PageContainer>
    );
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

  it('render the inner container', async () => {
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
