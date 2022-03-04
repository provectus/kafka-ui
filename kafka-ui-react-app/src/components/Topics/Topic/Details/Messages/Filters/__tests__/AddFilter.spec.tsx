import React from 'react';
import AddFilter, {
  FilterModalProps,
} from 'components/Topics/Topic/Details/Messages/Filters/AddFilter';
import { render } from 'lib/testHelpers';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const filters: MessageFilters[] = [{ name: 'name', code: 'code' }];
const setupComponent = (props?: Partial<FilterModalProps>) =>
  render(
    <AddFilter
      toggleIsOpen={jest.fn()}
      addFilter={jest.fn()}
      deleteFilter={jest.fn()}
      activeFilterHandler={jest.fn()}
      toggleEditModal={jest.fn()}
      editFilter={jest.fn()}
      filters={filters}
      {...props}
    />
  );

describe('AddFilter component', () => {
  it('renders component with filters', () => {
    setupComponent({ filters });
    expect(screen.getByRole('savedFilter')).toBeInTheDocument();
  });
  it('renders component without filters', () => {
    setupComponent({ filters: [] });
    expect(screen.getByText('no saved filter(s)')).toBeInTheDocument();
  });
  it('renders add filter modal with saved filters', () => {
    setupComponent();
    expect(screen.getByText('Created filters')).toBeInTheDocument();
  });
  describe('Filter deletion', () => {
    it('open deletion modal', () => {
      setupComponent();
      userEvent.hover(screen.getByRole('savedFilter'));
      waitFor(() => {
        userEvent.click(screen.getByRole('deleteIcon'));
        expect(screen.getByRole('deletionModal')).toBeInTheDocument();
      });
    });
    it('close deletion modal', () => {
      const deleteFilter = jest.fn();
      setupComponent({ filters, deleteFilter });
      userEvent.hover(screen.getByRole('savedFilter'));
      waitFor(() => {
        userEvent.click(screen.getByRole('deleteIcon'));
        expect(screen.getByRole('deletionModal')).toBeInTheDocument();
      });
      waitFor(() => {
        userEvent.click(screen.getByRole('button', { name: /Delete/i }));
        expect(deleteFilter).toHaveBeenCalledTimes(1);
        expect(
          screen.getByRole('button', { name: /Delete/i })
        ).not.toBeInTheDocument();
        expect(screen.getByRole('deletionModal')).not.toBeInTheDocument();
      });
    });
  });
  describe('Add new filter', () => {
    it('renders add new filter modal', () => {
      setupComponent();
      userEvent.click(screen.getByText('New filter'));
      expect(screen.getByText('Create a new filter')).toBeInTheDocument();
    });
    it('adding new filter', async () => {
      setupComponent();
      await waitFor(() => {
        userEvent.click(screen.getByText('New filter'));
      });
      expect(
        screen.getByRole('button', { name: /Add filter/i })
      ).toBeDisabled();
      expect(screen.getByPlaceholderText('Enter Name')).toBeInTheDocument();
      await waitFor(() => {
        userEvent.type(screen.getAllByRole('textbox')[0], 'filter name');
        userEvent.type(screen.getAllByRole('textbox')[1], 'filter code');
      });
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('filter name');
      expect(screen.getAllByRole('textbox')[1]).toHaveValue('filter code');
    });
  });
  describe('Edit filter', () => {
    it('opens editFilter modal', () => {
      const editFilter = jest.fn();
      const toggleEditModal = jest.fn();
      setupComponent({ editFilter, toggleEditModal });
      userEvent.click(screen.getByText('Edit'));
      expect(editFilter).toHaveBeenCalledTimes(1);
      expect(toggleEditModal).toHaveBeenCalledTimes(1);
    });
  });
  describe('save filter checkbox', () => {
    it('check uncheck save filter checkbox', () => {
      setupComponent();
      userEvent.click(screen.getByText('New filter'));
      expect(screen.getByText('Create a new filter')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      userEvent.click(screen.getByRole('checkbox'));
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });
});
