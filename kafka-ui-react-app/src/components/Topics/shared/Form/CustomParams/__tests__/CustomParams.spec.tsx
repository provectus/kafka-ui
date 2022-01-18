import React from 'react';
import { screen, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import CustomParams, {
  CustomParamsProps,
} from 'components/Topics/shared/Form/CustomParams/CustomParams';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';

describe('CustomParams', () => {
  const setupComponent = (props: CustomParamsProps) => {
    const Wrapper: React.FC = ({ children }) => {
      const methods = useForm();
      return <FormProvider {...methods}>{children}</FormProvider>;
    };

    return render(
      <Wrapper>
        <CustomParams {...props} />
      </Wrapper>
    );
  };

  beforeEach(() => {
    setupComponent({ isSubmitting: false });
  });

  it('renders with props', () => {
    const addParamButton = screen.getByRole('button');
    expect(addParamButton).toBeInTheDocument();
    expect(addParamButton).toHaveTextContent('Add Custom Parameter');
  });

  describe('works with user inputs correctly', () => {
    it('button click creates custom param fieldset', () => {
      const addParamButton = screen.getByRole('button');
      userEvent.click(addParamButton);

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();

      const textbox = screen.getByRole('textbox');
      expect(textbox).toBeInTheDocument();
    });

    it('can select option', () => {
      const addParamButton = screen.getByRole('button');
      userEvent.click(addParamButton);

      const listbox = screen.getByRole('listbox');

      userEvent.selectOptions(listbox, ['compression.type']);

      const option = screen.getByRole('option', {
        selected: true,
      });
      expect(option).toHaveValue('compression.type');
      expect(option).toBeDisabled();

      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue(TOPIC_CUSTOM_PARAMS['compression.type']);
    });

    it('when selected option changes disabled options update correctly', () => {
      const addParamButton = screen.getByRole('button');
      userEvent.click(addParamButton);

      const listbox = screen.getByRole('listbox');

      userEvent.selectOptions(listbox, ['compression.type']);

      const option = screen.getByRole('option', {
        name: 'compression.type',
      });
      expect(option).toBeDisabled();

      userEvent.selectOptions(listbox, ['delete.retention.ms']);
      const newOption = screen.getByRole('option', {
        name: 'delete.retention.ms',
      });
      expect(newOption).toBeDisabled();

      expect(option).toBeEnabled();
    });

    it('multiple button clicks create multiple fieldsets', () => {
      const addParamButton = screen.getByRole('button');
      userEvent.click(addParamButton);
      userEvent.click(addParamButton);
      userEvent.click(addParamButton);

      const listboxes = screen.getAllByRole('listbox');
      expect(listboxes.length).toBe(3);

      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBe(3);
    });

    it("can't select already selected option", () => {
      const addParamButton = screen.getByRole('button');
      userEvent.click(addParamButton);
      userEvent.click(addParamButton);

      const listboxes = screen.getAllByRole('listbox');

      const firstListbox = listboxes[0];
      userEvent.selectOptions(firstListbox, ['compression.type']);

      const firstListboxOption = within(firstListbox).getByRole('option', {
        selected: true,
      });
      expect(firstListboxOption).toBeDisabled();

      const secondListbox = listboxes[1];
      const secondListboxOption = within(secondListbox).getByRole('option', {
        name: 'compression.type',
      });
      expect(secondListboxOption).toBeDisabled();
    });

    it('when fieldset with selected custom property type is deleted disabled options update correctly', async () => {
      const addParamButton = screen.getByRole('button');
      userEvent.click(addParamButton);
      userEvent.click(addParamButton);
      userEvent.click(addParamButton);

      const listboxes = screen.getAllByRole('listbox');

      const firstListbox = listboxes[0];
      userEvent.selectOptions(firstListbox, ['compression.type']);

      const firstListboxOption = within(firstListbox).getByRole('option', {
        selected: true,
      });
      expect(firstListboxOption).toBeDisabled();

      const secondListbox = listboxes[1];
      userEvent.selectOptions(secondListbox, ['delete.retention.ms']);
      const secondListboxOption = within(secondListbox).getByRole('option', {
        selected: true,
      });
      expect(secondListboxOption).toBeDisabled();

      const thirdListbox = listboxes[2];
      userEvent.selectOptions(thirdListbox, ['file.delete.delay.ms']);
      const thirdListboxOption = within(thirdListbox).getByRole('option', {
        selected: true,
      });
      expect(thirdListboxOption).toBeDisabled();

      const deleteSecondFieldsetButton = screen.getByTitle(
        'Delete customParam field 1'
      );
      userEvent.click(deleteSecondFieldsetButton);
      expect(secondListbox).not.toBeInTheDocument();

      expect(
        within(firstListbox).getByRole('option', {
          name: 'delete.retention.ms',
        })
      ).toBeEnabled();

      expect(
        within(thirdListbox).getByRole('option', {
          name: 'delete.retention.ms',
        })
      ).toBeEnabled();
    });
  });
});
