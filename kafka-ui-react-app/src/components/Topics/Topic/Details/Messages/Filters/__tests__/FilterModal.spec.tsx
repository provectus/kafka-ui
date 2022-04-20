import React from 'react';
import FilterModal, {
  FilterModalProps,
} from 'components/Topics/Topic/Details/Messages/Filters/FilterModal';
import { render } from 'lib/testHelpers';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const filters: MessageFilters[] = [{ name: 'name', code: 'code' }];

const setupWrapper = (props?: Partial<FilterModalProps>) =>
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
  beforeEach(() => {
    setupWrapper();
  });
  it('renders component with add filter modal', () => {
    expect(
      screen.getByRole('heading', { name: /add filter/i, level: 3 })
    ).toBeInTheDocument();
  });
  it('renders component with edit filter modal', async () => {
    await waitFor(() => userEvent.click(screen.getByRole('savedFilterText')));
    await waitFor(() => userEvent.click(screen.getByText('Edit')));
    expect(
      screen.getByRole('heading', { name: /edit saved filter/i, level: 3 })
    ).toBeInTheDocument();
  });
});
