import React from 'react';
import AddEditFilterContainer, {
  AddEditFilterContainerProps,
} from 'components/Topics/Topic/Details/Messages/Filters/AddEditFilterContainer';
import { render } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';

describe('AddEditFilterContainer component', () => {
  const defaultSubmitBtn = 'Submit Button';

  const mockData: MessageFilters = {
    name: 'mockName',
    code: 'mockCode',
  };

  const setupComponent = (props: Partial<AddEditFilterContainerProps> = {}) => {
    const { submitBtnText } = props;
    return render(
      <AddEditFilterContainer
        cancelBtnHandler={jest.fn()}
        submitBtnText={submitBtnText || defaultSubmitBtn}
        {...props}
      />
    );
  };

  describe('default Component Parameters', () => {
    beforeEach(() => {
      setupComponent();
    });

    it('should check the default Button text', () => {
      expect(screen.getByText(defaultSubmitBtn)).toBeInTheDocument();
    });

    it('should check whether the submit Button is disabled when the form is pristine and disabled if dirty', async () => {
      const submitButtonElem = screen.getByText(defaultSubmitBtn);
      expect(submitButtonElem).toBeDisabled();

      const inputs = screen.getAllByRole('textbox');

      const textAreaElement = inputs[0];
      userEvent.type(textAreaElement, 'Hello World With TextArea');

      const inputNameElement = inputs[1];
      userEvent.type(inputNameElement, 'Hello World!');

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

      const textAreaElement = inputs[0];
      userEvent.type(textAreaElement, 'Hello World With TextArea');

      const inputNameElement = inputs[1];
      userEvent.type(inputNameElement, 'Hello World!');

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
      const textAreaElement = inputs[0];
      const inputNameElement = inputs[1];

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
      const submitCallback = jest.fn();
      setupComponent({
        submitCallback,
      });

      const inputs = screen.getAllByRole('textbox');

      const textAreaElement = inputs[0];
      userEvent.type(textAreaElement, 'Hello World With TextArea');

      const inputNameElement = inputs[1];
      userEvent.type(inputNameElement, 'Hello World!');

      const submitBtnElement = screen.getByText(defaultSubmitBtn);

      await waitFor(() => {
        expect(submitBtnElement).toBeEnabled();
      });

      userEvent.click(submitBtnElement);

      await waitFor(() => {
        expect(submitCallback).toBeCalled();
      });
    });

    it('should display the checkbox if the props is passed and initially check state', () => {
      setupComponent({ isAdd: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should pass and render the correct button text', () => {
      const submitBtnText = 'submitBtnTextTest';
      setupComponent({
        submitBtnText,
      });
      expect(screen.getByText(submitBtnText)).toBeInTheDocument();
    });
  });
});
