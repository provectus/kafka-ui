import React from 'react';
import AddFilter, {
  FilterModalProps,
} from 'components/Topics/Topic/Details/Messages/Filters/AddFilter';
import { render } from 'lib/testHelpers';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const filters: MessageFilters[] = [
  { name: 'name', code: 'code' },
  { name: 'name2', code: 'code2' },
];

const setupComponent = (props: Partial<FilterModalProps> = {}) =>
  render(
    <AddFilter
      toggleIsOpen={jest.fn()}
      addFilter={jest.fn()}
      deleteFilter={jest.fn()}
      activeFilterHandler={jest.fn()}
      toggleEditModal={jest.fn()}
      editFilter={jest.fn()}
      filters={props.filters || filters}
      {...props}
    />
  );

describe('AddFilter component', () => {
  it('should test click on Saved Filters redirects to Saved components', () => {
    setupComponent();
    userEvent.click(screen.getByRole('savedFilterText'));
    expect(screen.getByText('Saved filters')).toBeInTheDocument();
    expect(screen.getAllByRole('savedFilter')).toHaveLength(2);
  });

  describe('Add new filter', () => {
    beforeEach(() => {
      setupComponent();
    });

    it('adding new filter', async () => {
      const addFilterBtn = screen.getByRole('button', { name: /Add filter/i });
      expect(addFilterBtn).toBeDisabled();
      expect(screen.getByPlaceholderText('Enter Name')).toBeInTheDocument();
      await waitFor(() => {
        userEvent.type(screen.getAllByRole('textbox')[0], 'filter name');
        userEvent.type(screen.getAllByRole('textbox')[1], 'filter code');
      });
      expect(addFilterBtn).toBeEnabled();
      expect(screen.getAllByRole('textbox')[0]).toHaveValue('filter name');
      expect(screen.getAllByRole('textbox')[1]).toHaveValue('filter code');
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
