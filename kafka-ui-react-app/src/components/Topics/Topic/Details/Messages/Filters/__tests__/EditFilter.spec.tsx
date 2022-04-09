import React from 'react';
import EditFilter, {
  EditFilterProps,
} from 'components/Topics/Topic/Details/Messages/Filters/EditFilter';
import { render } from 'lib/testHelpers';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterEdit } from 'components/Topics/Topic/Details/Messages/Filters/FilterModal';

const editFilter: FilterEdit = {
  index: 0,
  filter: { name: 'name', code: 'code' },
};

const setupComponent = (props?: Partial<EditFilterProps>) =>
  render(
    <EditFilter
      toggleEditModal={jest.fn()}
      editSavedFilter={jest.fn()}
      editFilter={editFilter}
      {...props}
    />
  );

describe('EditFilter component', () => {
  it('renders component', () => {
    setupComponent();
    expect(screen.getByText(/edit saved filter/i)).toBeInTheDocument();
  });

  it('closes editFilter modal', () => {
    const toggleEditModal = jest.fn();
    setupComponent({ toggleEditModal });
    userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(toggleEditModal).toHaveBeenCalledTimes(1);
  });

  it('save edited fields and close modal', async () => {
    const toggleEditModal = jest.fn();
    const editSavedFilter = jest.fn();
    setupComponent({ toggleEditModal, editSavedFilter });
    await waitFor(() => fireEvent.submit(screen.getByRole('form')));
    expect(toggleEditModal).toHaveBeenCalledTimes(1);
    expect(editSavedFilter).toHaveBeenCalledTimes(1);
  });

  it('checks input values to match', () => {
    setupComponent();
    expect(screen.getAllByRole('textbox')[0]).toHaveValue(
      editFilter.filter.code
    );
    expect(screen.getAllByRole('textbox')[1]).toHaveValue(
      editFilter.filter.name
    );
  });
});
