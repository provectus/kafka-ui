import React from 'react';
import AddEditFilterContainer, {
  AddEditFilterContainerProps,
} from 'components/Topics/Topic/Details/Messages/Filters/AddEditFilterContainer';
import { render } from 'lib/testHelpers';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('AddEditFilterContainer component', () => {
  const defaultTitle = 'Test Title';
  const defaultSubmitBtn = 'Submit Button';
  const defaultNewFilter = 'Create New Filters';

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
});
