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
      userEvent.click(screen.getByTestId('deleteIcon'));
      expect(screen.getByRole('deletionModal')).toBeInTheDocument();
    });
    it('close deletion modal with button', () => {
      setupComponent();
      userEvent.hover(screen.getByRole('savedFilter'));
      userEvent.click(screen.getByTestId('deleteIcon'));
      expect(screen.getByRole('deletionModal')).toBeInTheDocument();
      const cancelButton = screen.getAllByRole('button', { name: /Cancel/i });
      userEvent.click(cancelButton[0]);
      expect(screen.getByText('Created filters')).toBeInTheDocument();
    });
    it('close deletion modal with close icon', () => {
      setupComponent();
      userEvent.hover(screen.getByRole('savedFilter'));
      userEvent.click(screen.getByTestId('deleteIcon'));
      expect(screen.getByRole('deletionModal')).toBeInTheDocument();
      userEvent.click(screen.getByTestId('closeDeletionModalIcon'));
      expect(screen.getByText('Created filters')).toBeInTheDocument();
    });
    it('delete filter', () => {
      const deleteFilter = jest.fn();
      setupComponent({ filters, deleteFilter });
      userEvent.hover(screen.getByRole('savedFilter'));
      userEvent.click(screen.getByTestId('deleteIcon'));
      userEvent.click(screen.getByRole('button', { name: /Delete/i }));
      expect(deleteFilter).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Created filters')).toBeInTheDocument();
    });
  });
  describe('Add new filter', () => {
    beforeEach(() => {
      setupComponent();
    });
    it('renders add new filter modal', async () => {
      await waitFor(() => {
        userEvent.click(screen.getByText('New filter'));
      });
      expect(screen.getByText('Create a new filter')).toBeInTheDocument();
    });
    it('adding new filter', async () => {
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
    it('close add new filter modal', () => {
      userEvent.click(screen.getByText('New filter'));
      expect(screen.getByText('Save this filter')).toBeInTheDocument();
      userEvent.click(screen.getByText('Cancel'));
      expect(screen.getByText('Created filters')).toBeInTheDocument();
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
  describe('Selecting a filter', () => {
    it('should mock the select function if the filter is check no otherwise', () => {
      const toggleOpenMock = jest.fn();
      const activeFilterMock = jest.fn() as (
        activeFilter: MessageFilters,
        index: number
      ) => void;
      setupComponent({
        filters,
        toggleIsOpen: toggleOpenMock,
        activeFilterHandler: activeFilterMock,
      });
      const selectFilterButton = screen.getByText(/Select filter/i);

      userEvent.click(selectFilterButton);
      expect(activeFilterMock).not.toHaveBeenCalled();
      expect(toggleOpenMock).not.toHaveBeenCalled();

      const savedFilterElement = screen.getByRole('savedFilter');
      userEvent.click(savedFilterElement);
      userEvent.click(selectFilterButton);

      expect(activeFilterMock).toHaveBeenCalled();
      expect(toggleOpenMock).toHaveBeenCalled();
    });
  });
  describe('onSubmit with Filter being saved', () => {
    let addFilterMock: (values: MessageFilters) => void;
    let activeFilterHandlerMock: (
      activeFilter: MessageFilters,
      index: number
    ) => void;
    beforeEach(async () => {
      addFilterMock = jest.fn() as (values: MessageFilters) => void;
      activeFilterHandlerMock = jest.fn() as (
        activeFilter: MessageFilters,
        index: number
      ) => void;
      setupComponent({
        addFilter: addFilterMock,
        activeFilterHandler: activeFilterHandlerMock,
      });
      userEvent.click(screen.getByText(/New filter/i));
      await waitFor(() => {
        userEvent.type(screen.getAllByRole('textbox')[0], 'filter name');
        userEvent.type(screen.getAllByRole('textbox')[1], 'filter code');
      });
    });

    it('OnSubmit condition with checkbox off functionality', async () => {
      userEvent.click(screen.getAllByRole('button')[1]);
      await waitFor(() => {
        expect(activeFilterHandlerMock).toHaveBeenCalled();
        expect(addFilterMock).not.toHaveBeenCalled();
      });
    });

    it('OnSubmit condition with checkbox on functionality', async () => {
      userEvent.click(screen.getByRole('checkbox'));

      userEvent.click(screen.getAllByRole('button')[1]);
      await waitFor(() => {
        expect(activeFilterHandlerMock).not.toHaveBeenCalled();
        expect(addFilterMock).toHaveBeenCalled();
      });
    });
  });
});
