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

  it('should test click on return to custom filter redirects to Add filters', () => {
    setupComponent();
    userEvent.click(screen.getByRole('savedFilterText'));
    expect(screen.getByText('Saved filters')).toBeInTheDocument();
    expect(screen.queryByRole('savedFilterText')).not.toBeInTheDocument();
    expect(screen.getAllByRole('savedFilter')).toHaveLength(2);

    userEvent.click(screen.getByText(/back to custom filters/i));
    expect(screen.queryByText('Saved filters')).not.toBeInTheDocument();
    expect(screen.getByRole('savedFilterText')).toBeInTheDocument();
  });

  describe('Add new filter', () => {
    beforeEach(() => {
      setupComponent();
    });

    it('adding new filter', async () => {
      const codeValue = 'filter code';
      const nameValue = 'filter name';
      const textBoxes = screen.getAllByRole('textbox');

      const codeTextBox = textBoxes[0];
      const nameTextBox = textBoxes[1];

      const addFilterBtn = screen.getByRole('button', { name: /Add filter/i });
      expect(addFilterBtn).toBeDisabled();
      expect(screen.getByPlaceholderText('Enter Name')).toBeInTheDocument();
      await waitFor(() => {
        userEvent.type(codeTextBox, codeValue);
        userEvent.type(nameTextBox, nameValue);
      });
      expect(addFilterBtn).toBeEnabled();
      expect(codeTextBox).toHaveValue(codeValue);
      expect(nameTextBox).toHaveValue(nameValue);
    });

    it('should check unSaved filter without name', async () => {
      const codeTextBox = screen.getAllByRole('textbox')[0];
      const code = 'filter code';
      const addFilterBtn = screen.getByRole('button', { name: /Add filter/i });
      expect(addFilterBtn).toBeDisabled();
      expect(screen.getByPlaceholderText('Enter Name')).toBeInTheDocument();
      await waitFor(() => {
        userEvent.type(codeTextBox, code);
      });
      expect(addFilterBtn).toBeEnabled();
      expect(codeTextBox).toHaveValue(code);
    });
  });

  describe('onSubmit with Filter being saved', () => {
    const addFilterMock = jest.fn();
    const activeFilterHandlerMock = jest.fn();
    const toggleModelMock = jest.fn();

    const codeValue = 'filter code';
    const nameValue = 'filter name';

    beforeEach(async () => {
      setupComponent({
        addFilter: addFilterMock,
        activeFilterHandler: activeFilterHandlerMock,
        toggleIsOpen: toggleModelMock,
      });

      await waitFor(() => {
        userEvent.type(screen.getAllByRole('textbox')[0], codeValue);
        userEvent.type(screen.getAllByRole('textbox')[1], nameValue);
      });
    });

    afterEach(() => {
      addFilterMock.mockClear();
      activeFilterHandlerMock.mockClear();
      toggleModelMock.mockClear();
    });

    it('OnSubmit condition with checkbox off functionality', async () => {
      // since both values are in it
      const addFilterBtn = screen.getByRole('button', { name: /Add filter/i });
      expect(addFilterBtn).toBeEnabled();
      userEvent.click(addFilterBtn);

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
        expect(toggleModelMock).not.toHaveBeenCalled();
      });
    });

    it('should check the state submit button when checkbox state changes so is name input value', async () => {
      const checkbox = screen.getByRole('checkbox');
      const codeTextBox = screen.getAllByRole('textbox')[0];
      const nameTextBox = screen.getAllByRole('textbox')[1];
      const addFilterBtn = screen.getByRole('button', { name: /Add filter/i });

      userEvent.clear(nameTextBox);
      expect(nameTextBox).toHaveValue('');

      userEvent.click(addFilterBtn);
      await waitFor(() => {
        expect(activeFilterHandlerMock).toHaveBeenCalledTimes(1);
        expect(activeFilterHandlerMock).toHaveBeenCalledWith(
          {
            name: 'Unsaved filter',
            code: codeValue,
            saveFilter: false,
          },
          -1
        );
        // get reset-ed
        expect(codeTextBox).toHaveValue('');
        expect(toggleModelMock).toHaveBeenCalled();
      });

      userEvent.type(codeTextBox, codeValue);
      expect(codeTextBox).toHaveValue(codeValue);

      userEvent.click(checkbox);
      expect(addFilterBtn).toBeDisabled();

      userEvent.type(nameTextBox, nameValue);
      expect(nameTextBox).toHaveValue(nameValue);

      await waitFor(() => {
        expect(addFilterBtn).toBeEnabled();
      });

      userEvent.click(addFilterBtn);

      await waitFor(() => {
        expect(activeFilterHandlerMock).toHaveBeenCalledTimes(1);
        expect(addFilterMock).toHaveBeenCalledWith({
          name: nameValue,
          code: codeValue,
          saveFilter: true,
        });
      });
    });
  });
});
