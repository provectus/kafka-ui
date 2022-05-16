import React from 'react';
import AddEditFilterContainer, {
  AddEditFilterContainerProps,
} from 'components/Topics/Topic/Details/Messages/Filters/AddEditFilterContainer';
import { render } from 'lib/testHelpers';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';

describe('AddEditFilterContainer component', () => {
  const defaultSubmitBtn = 'Submit Button';

  const mockData: MessageFilters = {
    name: 'mockName',
    code: 'mockCode',
  };

  const renderComponent = (
    props: Partial<AddEditFilterContainerProps> = {}
  ) => {
    render(
      <AddEditFilterContainer
        cancelBtnHandler={jest.fn()}
        submitBtnText={props.submitBtnText || defaultSubmitBtn}
        {...props}
      />
    );
  };

  describe('default Component Parameters', () => {
    beforeEach(async () => {
      await act(() => renderComponent());
    });

    it('should check the default Button text', () => {
      expect(screen.getByText(defaultSubmitBtn)).toBeInTheDocument();
    });

    it('should check whether the submit Button is disabled when the form is pristine and disabled if dirty', async () => {
      const submitButtonElem = screen.getByText(defaultSubmitBtn);
      expect(submitButtonElem).toBeDisabled();

      const inputs = screen.getAllByRole('textbox');

      const textAreaElement = inputs[0] as HTMLTextAreaElement;
      await act(() =>
        userEvent.paste(textAreaElement, 'Hello World With TextArea')
      );

      const inputNameElement = inputs[1];
      await act(() => userEvent.type(inputNameElement, 'Hello World!'));

      expect(submitButtonElem).toBeEnabled();

      await act(() => userEvent.clear(inputNameElement));

      expect(submitButtonElem).toBeDisabled();
    });

    it('should view the error message after typing and clearing the input', async () => {
      const inputs = screen.getAllByRole('textbox');

      const textAreaElement = inputs[0] as HTMLTextAreaElement;
      await act(() =>
        userEvent.paste(textAreaElement, 'Hello World With TextArea')
      );

      const inputNameElement = inputs[1];
      await act(() => {
        userEvent.type(inputNameElement, 'Hello World!');

        userEvent.clear(inputNameElement);
        userEvent.clear(textAreaElement);
      });

      expect(screen.getByText(/required field/i)).toBeInTheDocument();
    });
  });

  describe('Custom setup for the component', () => {
    it('should render the input with default data if they are passed', async () => {
      renderComponent({
        inputDisplayNameDefaultValue: mockData.name,
        inputCodeDefaultValue: mockData.code,
      });

      const inputs = screen.getAllByRole('textbox');
      const textAreaElement = inputs[0] as HTMLTextAreaElement;
      const inputNameElement = inputs[1];
      expect(inputNameElement).toHaveValue(mockData.name);
      expect(textAreaElement.value).toEqual('');
    });

    it('should test whether the cancel callback is being called', async () => {
      const cancelCallback = jest.fn();
      renderComponent({
        cancelBtnHandler: cancelCallback,
      });
      const cancelBtnElement = screen.getByText(/cancel/i);

      await act(() => userEvent.click(cancelBtnElement));
      expect(cancelCallback).toBeCalled();
    });

    it('should test whether the submit Callback is being called', async () => {
      const submitCallback = jest.fn();
      renderComponent({
        submitCallback,
      });

      const inputs = screen.getAllByRole('textbox');

      const textAreaElement = inputs[0] as HTMLTextAreaElement;
      userEvent.paste(textAreaElement, 'Hello World With TextArea');

      const inputNameElement = inputs[1];
      await act(() => userEvent.type(inputNameElement, 'Hello World!'));

      const submitBtnElement = screen.getByText(defaultSubmitBtn);

      expect(submitBtnElement).toBeEnabled();

      await act(() => userEvent.click(submitBtnElement));

      expect(submitCallback).toBeCalled();
    });

    it('should display the checkbox if the props is passed and initially check state', async () => {
      renderComponent({ isAdd: true });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      await act(() => userEvent.click(checkbox));
      expect(checkbox).toBeChecked();
    });

    it('should pass and render the correct button text', async () => {
      const submitBtnText = 'submitBtnTextTest';
      await act(() =>
        renderComponent({
          submitBtnText,
        })
      );
      expect(screen.getByText(submitBtnText)).toBeInTheDocument();
    });
  });
});
