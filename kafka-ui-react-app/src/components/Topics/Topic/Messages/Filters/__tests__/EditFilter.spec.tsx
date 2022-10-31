import React from 'react';
import EditFilter, {
  EditFilterProps,
} from 'components/Topics/Topic/Messages/Filters/EditFilter';
import { render } from 'lib/testHelpers';
import { screen, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterEdit } from 'components/Topics/Topic/Messages/Filters/FilterModal';

const editFilter: FilterEdit = {
  index: 0,
  filter: { name: 'name', code: '' },
};

const renderComponent = (props?: Partial<EditFilterProps>) =>
  render(
    <EditFilter
      toggleEditModal={jest.fn()}
      editSavedFilter={jest.fn()}
      editFilter={editFilter}
      {...props}
    />
  );

describe('EditFilter component', () => {
  it('renders component', async () => {
    await act(() => {
      renderComponent();
    });
    expect(screen.getByText(/edit saved filter/i)).toBeInTheDocument();
  });

  it('closes editFilter modal', async () => {
    const toggleEditModal = jest.fn();
    await act(() => {
      renderComponent({ toggleEditModal });
    });
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(toggleEditModal).toHaveBeenCalledTimes(1);
  });

  it('save edited fields and close modal', async () => {
    const toggleEditModal = jest.fn();
    const editSavedFilter = jest.fn();

    await renderComponent({ toggleEditModal, editSavedFilter });

    const inputs = screen.getAllByRole('textbox');
    const textAreaElement = inputs[0] as HTMLTextAreaElement;
    const inputNameElement = inputs[1];
    await act(async () => {
      textAreaElement.focus();
      await userEvent.paste('edited code');
      textAreaElement.focus();
      await userEvent.type(inputNameElement, 'edited name');
      fireEvent.submit(screen.getByRole('form'));
    });
    expect(toggleEditModal).toHaveBeenCalledTimes(1);
    expect(editSavedFilter).toHaveBeenCalledTimes(1);
  });

  it('checks input values to match', async () => {
    await act(() => {
      renderComponent();
    });
    const inputs = screen.getAllByRole('textbox');
    const textAreaElement = inputs[0] as HTMLTextAreaElement;
    const inputNameElement = inputs[1];
    const span = within(textAreaElement).getByText(editFilter.filter.code);
    expect(span).toHaveValue(editFilter.filter.code);
    expect(inputNameElement).toHaveValue(editFilter.filter.name);
  });
});
