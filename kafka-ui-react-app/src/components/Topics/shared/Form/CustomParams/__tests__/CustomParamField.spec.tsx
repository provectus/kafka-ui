import React from 'react';
import { screen, within } from '@testing-library/react';
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
const remove = jest.fn();
const setExistingFields = jest.fn();

const SPACE_KEY = ' ';

describe('CustomParamsField', () => {
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

  it('renders with props', () => {
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
      expect(remove.mock.calls.length).toBe(1);
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
      expect(remove.mock.calls.length).toBe(2);
    });

    it('can select option', () => {
      setupComponent({
        field,
        isDisabled,
        index,
        remove,
        existingFields,
        setExistingFields,
      });
      const listbox = screen.getByRole('listbox');
      userEvent.selectOptions(listbox, ['compression.type']);

      const option = within(listbox).getByRole('option', { selected: true });
      expect(option).toHaveValue('compression.type');
    });

    it('selecting option updates textbox value', () => {
      setupComponent({
        field,
        isDisabled,
        index,
        remove,
        existingFields,
        setExistingFields,
      });
      const listbox = screen.getByRole('listbox');
      userEvent.selectOptions(listbox, ['compression.type']);

      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue(TOPIC_CUSTOM_PARAMS['compression.type']);
    });

    it('selecting option updates triggers setExistingFields', () => {
      setupComponent({
        field,
        isDisabled,
        index,
        remove,
        existingFields,
        setExistingFields,
      });
      const listbox = screen.getByRole('listbox');
      userEvent.selectOptions(listbox, ['compression.type']);

      expect(setExistingFields.mock.calls.length).toBe(1);
    });
  });
});
