import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import CustomParamsField, {
  Props,
} from 'components/Topics/shared/Form/CustomParams/CustomParamField';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';

const isDisabled = false;
const index = 0;
const existingFields: string[] = [];
const field = { name: 'name', value: 'value', id: 'id' };

const SPACE_KEY = ' ';

const selectOption = async (listbox: HTMLElement, option: string) => {
  await waitFor(() => userEvent.click(listbox));
  await waitFor(() => userEvent.click(screen.getByText(option)));
};

describe('CustomParamsField', () => {
  const remove = jest.fn();
  const setExistingFields = jest.fn();

  const setupComponent = (props: Props) => {
    const Wrapper: React.FC = ({ children }) => {
      const methods = useForm();
      return <FormProvider {...methods}>{children}</FormProvider>;
    };

    return render(
      <Wrapper>
        <CustomParamsField {...props} />
      </Wrapper>
    );
  };

  afterEach(() => {
    remove.mockClear();
    setExistingFields.mockClear();
  });

  it('renders the component with its view correctly', () => {
    setupComponent({
      field,
      isDisabled,
      index,
      remove,
      existingFields,
      setExistingFields,
    });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  describe('core functionality works', () => {
    it('click on button triggers remove', () => {
      setupComponent({
        field,
        isDisabled,
        index,
        remove,
        existingFields,
        setExistingFields,
      });
      userEvent.click(screen.getByRole('button'));
      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('pressing space on button triggers remove', () => {
      setupComponent({
        field,
        isDisabled,
        index,
        remove,
        existingFields,
        setExistingFields,
      });
      userEvent.type(screen.getByRole('button'), SPACE_KEY);
      // userEvent.type triggers remove two times as at first it clicks on element and then presses space
      expect(remove).toHaveBeenCalledTimes(2);
    });

    it('can select option', async () => {
      setupComponent({
        field,
        isDisabled,
        index,
        remove,
        existingFields,
        setExistingFields,
      });
      const listbox = screen.getByRole('listbox');
      await selectOption(listbox, 'compression.type');

      const selectedOption = within(listbox).getAllByRole('option');
      expect(selectedOption.length).toEqual(1);
      expect(selectedOption[0]).toHaveTextContent('compression.type');
    });

    it('selecting option updates textbox value', async () => {
      setupComponent({
        field,
        isDisabled,
        index,
        remove,
        existingFields,
        setExistingFields,
      });
      const listbox = screen.getByRole('listbox');
      await selectOption(listbox, 'compression.type');

      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue(TOPIC_CUSTOM_PARAMS['compression.type']);
    });

    it('selecting option updates triggers setExistingFields', async () => {
      setupComponent({
        field,
        isDisabled,
        index,
        remove,
        existingFields,
        setExistingFields,
      });
      const listbox = screen.getByRole('listbox');
      await selectOption(listbox, 'compression.type');

      expect(setExistingFields).toHaveBeenCalledTimes(1);
    });
  });
});
