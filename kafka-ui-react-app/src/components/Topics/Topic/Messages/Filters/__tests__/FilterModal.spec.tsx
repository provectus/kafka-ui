import React from 'react';
import FilterModal, {
  FilterModalProps,
} from 'components/Topics/Topic/Messages/Filters/FilterModal';
import { render } from 'lib/testHelpers';
import {
  ActiveMessageFilter,
  MessageFilters,
} from 'components/Topics/Topic/Messages/Filters/Filters';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const filter = { name: 'name', code: 'code' };
const filters: MessageFilters[] = [filter];
const activeFilter: ActiveMessageFilter = { index: -1, ...filter };

const renderComponent = (props?: Partial<FilterModalProps>) =>
  render(
    <FilterModal
      toggleIsOpen={jest.fn()}
      filters={filters}
      addFilter={jest.fn()}
      deleteFilter={jest.fn()}
      activeFilterHandler={jest.fn()}
      editSavedFilter={jest.fn()}
      activeFilter={activeFilter}
      {...props}
    />
  );

describe('FilterModal component', () => {
  it('renders component with add filter modal', async () => {
    await act(() => {
      renderComponent();
    });
    expect(
      screen.getByRole('heading', { name: /add filter/i, level: 3 })
    ).toBeInTheDocument();
  });
  it('renders component with edit filter modal', async () => {
    renderComponent();
    await userEvent.click(screen.getByRole('savedFilterText'));
    await userEvent.click(screen.getByText('Edit'));
    expect(
      screen.getByRole('heading', { name: /edit filter/i, level: 3 })
    ).toBeInTheDocument();
  });
});
