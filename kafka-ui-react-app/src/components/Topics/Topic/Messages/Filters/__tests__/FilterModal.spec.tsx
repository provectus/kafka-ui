import React from 'react';
import FilterModal, {
  FilterModalProps,
} from 'components/Topics/Topic/Messages/Filters/FilterModal';
import { render } from 'lib/testHelpers';
import { MessageFilters } from 'components/Topics/Topic/Messages/Filters/Filters';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const filters: MessageFilters[] = [{ name: 'name', code: 'code' }];

const renderComponent = (props?: Partial<FilterModalProps>) =>
  render(
    <FilterModal
      toggleIsOpen={jest.fn()}
      filters={filters}
      addFilter={jest.fn()}
      deleteFilter={jest.fn()}
      activeFilterHandler={jest.fn()}
      editSavedFilter={jest.fn()}
      {...props}
    />
  );
describe('FilterModal component', () => {
  beforeEach(async () => {
    await act(() => {
      renderComponent();
    });
  });
  it('renders component with add filter modal', () => {
    expect(
      screen.getByRole('heading', { name: /add filter/i, level: 3 })
    ).toBeInTheDocument();
  });
  it('renders component with edit filter modal', async () => {
    await userEvent.click(screen.getByRole('savedFilterText'));
    await userEvent.click(screen.getByText('Edit'));
    expect(
      screen.getByRole('heading', { name: /edit saved filter/i, level: 3 })
    ).toBeInTheDocument();
  });
});
