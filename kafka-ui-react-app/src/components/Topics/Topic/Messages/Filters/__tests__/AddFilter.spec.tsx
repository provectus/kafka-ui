import React from 'react';
import AddFilter, {
  FilterModalProps,
} from 'components/Topics/Topic/Messages/Filters/AddFilter';
import { render } from 'lib/testHelpers';
import { MessageFilters } from 'components/Topics/Topic/Messages/Filters/Filters';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const filters: MessageFilters[] = [
  { name: 'name', code: 'code' },
  { name: 'name2', code: 'code2' },
];

const editFilterMock = jest.fn();

const renderComponent = (props: Partial<FilterModalProps> = {}) =>
  render(
    <AddFilter
      toggleIsOpen={jest.fn()}
      addFilter={jest.fn()}
      deleteFilter={jest.fn()}
      activeFilterHandler={jest.fn()}
      toggleEditModal={jest.fn()}
      onClickSavedFilters={jest.fn()}
      editFilter={editFilterMock}
      filters={props.filters || filters}
      isSavedFiltersOpen={false}
      {...props}
    />
  );

describe('AddFilter component', () => {
  describe('', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('should test click on Saved Filters redirects to Saved components', async () => {
      await userEvent.click(screen.getByRole('savedFilterText'));
      expect(screen.getByText('Saved Filters')).toBeInTheDocument();
      expect(screen.getByRole('savedFilterText')).toBeInTheDocument();
    });

    it('info button to be in the document', () => {
      expect(screen.getByRole('button', { name: 'info' })).toBeInTheDocument();
    });

    it('renders InfoModal', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'info' }));
      expect(screen.getByRole('button', { name: 'Ok' })).toBeInTheDocument();
      expect(
        screen.getByRole('list', { name: 'info-list' })
      ).toBeInTheDocument();
    });

    it('should test click on return to custom filter redirects to Saved Filters', async () => {
      await userEvent.click(screen.getByRole('savedFilterText'));

      expect(screen.queryByText('Saved filters')).not.toBeInTheDocument();
      expect(screen.getByRole('savedFilterText')).toBeInTheDocument();
    });
  });

  describe('Add new filter', () => {
    beforeEach(async () => {
      renderComponent();
    });

    it('adding new filter', async () => {
      const codeValue = 'filter code';
      const nameValue = 'filter name';
      const textBoxes = screen.getAllByRole('textbox');

      const codeTextBox = textBoxes[0] as HTMLTextAreaElement;
      const nameTextBox = textBoxes[1];

      const addFilterBtn = screen.getByRole('button', { name: /Add filter/i });
      expect(addFilterBtn).toBeDisabled();
      expect(screen.getByPlaceholderText('Enter Name')).toBeInTheDocument();

      await act(async () => {
        codeTextBox.focus();
        await userEvent.paste(codeValue);
        await userEvent.type(nameTextBox, nameValue);
      });

      expect(addFilterBtn).toBeEnabled();
      expect(codeTextBox.value).toEqual(`${codeValue}\n\n`);
      expect(nameTextBox).toHaveValue(nameValue);
    });

    it('should check unSaved filter without name', async () => {
      const codeTextBox = screen.getAllByRole(
        'textbox'
      )[0] as HTMLTextAreaElement;
      const code = 'filter code';
      const addFilterBtn = screen.getByRole('button', { name: /Add filter/i });
      expect(addFilterBtn).toBeDisabled();
      expect(screen.getByPlaceholderText('Enter Name')).toBeInTheDocument();
      await act(async () => {
        codeTextBox.focus();
        await userEvent.paste(code);
      });
      expect(addFilterBtn).toBeEnabled();
      expect(codeTextBox).toHaveValue(`${code}\n\n`);
    });

    it('calls editFilter when edit button is clicked in saved filters', async () => {
      await act(() => {
        renderComponent({ isSavedFiltersOpen: true });
      });
      await userEvent.click(screen.getByText('Saved Filters'));
      const index = 0;
      const editButton = screen.getAllByText('Edit')[index];
      await userEvent.click(editButton);
      const { code, name } = filters[index];
      expect(editFilterMock).toHaveBeenCalledTimes(1);
      expect(editFilterMock).toHaveBeenCalledWith({
        index,
        filter: { code, name },
      });
    });
  });

  describe('onSubmit with Filter being saved', () => {
    const addFilterMock = jest.fn();
    const activeFilterHandlerMock = jest.fn();
    const toggleModelMock = jest.fn();

    const codeValue = 'filter code';
    const longCodeValue = 'a long filter code';
    const nameValue = 'filter name';

    beforeEach(async () => {
      await renderComponent({
        addFilter: addFilterMock,
        activeFilterHandler: activeFilterHandlerMock,
        toggleIsOpen: toggleModelMock,
      });
    });

    afterEach(() => {
      addFilterMock.mockClear();
      activeFilterHandlerMock.mockClear();
      toggleModelMock.mockClear();
    });

    describe('OnSubmit conditions with codeValue and nameValue in fields', () => {
      beforeEach(async () => {
        const textAreaElement = screen.getAllByRole(
          'textbox'
        )[0] as HTMLTextAreaElement;
        const input = screen.getAllByRole('textbox')[1];
        await act(async () => {
          textAreaElement.focus();
          await userEvent.paste(codeValue);
          await userEvent.type(input, nameValue);
        });
      });

      it('OnSubmit condition with checkbox off functionality', async () => {
        // since both values are in it
        const addFilterBtn = screen.getByRole('button', {
          name: /Add filter/i,
        });
        expect(addFilterBtn).toBeEnabled();

        await act(async () => {
          await userEvent.click(addFilterBtn);
        });

        expect(activeFilterHandlerMock).toHaveBeenCalled();
        expect(addFilterMock).not.toHaveBeenCalled();
      });

      it('OnSubmit condition with checkbox on functionality', async () => {
        await act(async () => {
          await userEvent.click(screen.getByRole('checkbox'));
          await userEvent.click(screen.getAllByRole('button')[2]);
        });

        expect(activeFilterHandlerMock).not.toHaveBeenCalled();
        expect(addFilterMock).toHaveBeenCalled();
        expect(toggleModelMock).not.toHaveBeenCalled();
      });

      it('should check the state submit button when checkbox state changes so is name input value', async () => {
        const checkbox = screen.getByRole('checkbox');
        const codeTextBox = screen.getAllByRole(
          'textbox'
        )[0] as HTMLTextAreaElement;
        const nameTextBox = screen.getAllByRole('textbox')[1];
        const addFilterBtn = screen.getByRole('button', {
          name: /Add filter/i,
        });

        await act(async () => {
          await userEvent.clear(nameTextBox);
        });

        expect(nameTextBox).toHaveValue('');

        await act(async () => {
          await userEvent.click(addFilterBtn);
        });
        expect(activeFilterHandlerMock).toHaveBeenCalledTimes(1);

        expect(activeFilterHandlerMock).toHaveBeenCalledWith(
          {
            name: codeValue,
            code: codeValue,
            saveFilter: false,
          },
          -1
        );
        // get reset-ed
        expect(codeTextBox).toHaveValue(``);
        expect(toggleModelMock).toHaveBeenCalled();
        codeTextBox.focus();
        await act(async () => {
          await userEvent.paste(codeValue);
        });
        expect(codeTextBox).toHaveValue(`${codeValue}\n\n`);

        await act(async () => {
          await userEvent.click(checkbox);
        });
        expect(addFilterBtn).toBeDisabled();

        await act(async () => {
          await userEvent.type(nameTextBox, nameValue);
        });
        expect(nameTextBox).toHaveValue(nameValue);
        expect(addFilterBtn).toBeEnabled();
        await act(async () => {
          await userEvent.click(addFilterBtn);
        });

        expect(activeFilterHandlerMock).toHaveBeenCalledTimes(1);
        expect(addFilterMock).toHaveBeenCalledWith({
          name: nameValue,
          code: codeValue,
          saveFilter: true,
        });
      });
    });

    it('should use sliced code as the filter name if filter name is empty', async () => {
      const codeTextBox = screen.getAllByRole(
        'textbox'
      )[0] as HTMLTextAreaElement;
      const nameTextBox = screen.getAllByRole('textbox')[1];
      const addFilterBtn = screen.getByRole('button', { name: /Add filter/i });
      act(() => {
        // await userEvent.clear(nameTextBox);
        // codeTextBox.focus();
        // await userEvent.clear(codeTextBox);
        fireEvent.input(nameTextBox, {
          inputType: '',
        });
        fireEvent.input(codeTextBox, {
          inputType: '',
        });
      });
      codeTextBox.focus();
      await userEvent.paste(longCodeValue);
      expect(nameTextBox).toHaveValue('');
      expect(codeTextBox).toHaveValue(`${longCodeValue}\n\n`);

      await userEvent.click(addFilterBtn);

      const filterName = `${longCodeValue.slice(0, 16)}...`;

      expect(activeFilterHandlerMock).toHaveBeenCalledTimes(1);
      expect(activeFilterHandlerMock).toHaveBeenCalledWith(
        {
          name: filterName,
          code: longCodeValue,
          saveFilter: false,
        },
        -1
      );
      expect(codeTextBox).toHaveValue('');
      expect(toggleModelMock).toHaveBeenCalled();
    });
  });
});
