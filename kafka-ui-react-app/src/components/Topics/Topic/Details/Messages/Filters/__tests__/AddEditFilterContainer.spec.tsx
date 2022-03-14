import React from 'react';
import AddEditFilterContainer, {
  AddEditFilterContainerProps,
} from 'components/Topics/Topic/Details/Messages/Filters/AddEditFilterContainer';
import { render } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';

describe('AddEditFilterContainer component', () => {
  const defaultTitle = 'Test Title';
  const defaultSubmitBtn = 'Submit Button';
  const defaultNewFilter = 'Create New Filters';

  const mockData: MessageFilters = {
    name: 'mockName',
    code: 'mockCode',
  };

  const setupComponent = (props: Partial<AddEditFilterContainerProps> = {}) => {
    const { title, submitBtnText, createNewFilterText } = props;
    return render(
      <AddEditFilterContainer
        title={title || defaultTitle}
        cancelBtnHandler={jest.fn()}
        submitBtnText={submitBtnText || defaultSubmitBtn}
        createNewFilterText={createNewFilterText || defaultNewFilter}
        toggleSaveFilterSetter={jest.fn()}
        {...props}
      />
    );
  };

  describe('default Component Parameters', () => {
    beforeEach(() => {
      setupComponent();
    });
    it('should render the components', () => {
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should check the default parameters values', () => {
      expect(screen.getByText(defaultTitle)).toBeInTheDocument();
      expect(screen.getByText(defaultSubmitBtn)).toBeInTheDocument();
      expect(screen.getByText(defaultNewFilter)).toBeInTheDocument();
    });

    it('should check whether the submit Button is disabled when the form is pristine and disabled if dirty', async () => {
      const submitButtonElem = screen.getByText(defaultSubmitBtn);
      expect(submitButtonElem).toBeDisabled();

      const inputs = screen.getAllByRole('textbox');

      const inputNameElement = inputs[0];
      userEvent.type(inputNameElement, 'Hello World!');

      const textAreaElement = inputs[1];
      userEvent.type(textAreaElement, 'Hello World With TextArea');

      await waitFor(() => {
        expect(submitButtonElem).toBeEnabled();
      });

      userEvent.clear(inputNameElement);

      await waitFor(() => {
        expect(submitButtonElem).toBeDisabled();
      });
    });

    it('should view the error message after typing and clearing the input', async () => {
      const inputs = screen.getAllByRole('textbox');

      const inputNameElement = inputs[0];
      userEvent.type(inputNameElement, 'Hello World!');

      const textAreaElement = inputs[1];
      userEvent.type(textAreaElement, 'Hello World With TextArea');

      userEvent.clear(inputNameElement);
      userEvent.clear(textAreaElement);

      await waitFor(() => {
        const requiredFieldTextElements =
          screen.getAllByText(/required field/i);
        expect(requiredFieldTextElements).toHaveLength(2);
      });
    });
  });

  describe('Custom setup for the component', () => {
    it('should render the input with default data if they are passed', () => {
      setupComponent({
        inputDisplayNameDefaultValue: mockData.name,
        inputCodeDefaultValue: mockData.code,
      });

      const inputs = screen.getAllByRole('textbox');
      const inputNameElement = inputs[0];
      const textAreaElement = inputs[1];

      expect(inputNameElement).toHaveValue(mockData.name);
      expect(textAreaElement).toHaveValue(mockData.code);
    });

    it('should test whether the cancel callback is being called', async () => {
      const cancelCallback = jest.fn();
      setupComponent({
        cancelBtnHandler: cancelCallback,
      });
      const cancelBtnElement = screen.getByText(/cancel/i);
      userEvent.click(cancelBtnElement);
      expect(cancelCallback).toBeCalled();
    });

    it('should test whether the submit Callback is being called', async () => {
      const submitCallback = jest.fn() as (v: MessageFilters) => void;
      setupComponent({
        submitCallback,
      });

      const inputs = screen.getAllByRole('textbox');

      const inputNameElement = inputs[0];
      userEvent.type(inputNameElement, 'Hello World!');

      const textAreaElement = inputs[1];
      userEvent.type(textAreaElement, 'Hello World With TextArea');

      const submitBtnElement = screen.getByText(defaultSubmitBtn);

      await waitFor(() => {
        expect(submitBtnElement).toBeEnabled();
      });

      userEvent.click(submitBtnElement);

      await waitFor(() => {
        expect(submitCallback).toBeCalled();
      });
    });

    it('should display the checkbox if the props is passed and click stay checking', async () => {
      const setCheckboxMock = jest.fn();
      setupComponent({
        toggleSaveFilterSetter: setCheckboxMock,
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();

      userEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      await waitFor(() => {
        expect(setCheckboxMock).toBeCalled();
      });
    });

    it('should display the checkbox if the props is passed and initially check state', () => {
      setupComponent({
        toggleSaveFilterSetter: jest.fn(),
        toggleSaveFilterValue: true,
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    it('should pass and render the view props', () => {
      const title = 'titleTest';
      const createNewFilterText = 'createNewFilterTextTest';
      const submitBtnText = 'submitBtnTextTest';
      setupComponent({
        title,
        createNewFilterText,
        submitBtnText,
      });
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(createNewFilterText)).toBeInTheDocument();
      expect(screen.getByText(submitBtnText)).toBeInTheDocument();
    });
  });
});
