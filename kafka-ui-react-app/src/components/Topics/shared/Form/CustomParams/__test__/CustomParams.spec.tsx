import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import CustomParams, {
  CustomParamsProps,
} from 'components/Topics/shared/Form/CustomParams/CustomParams';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';

import { defaultValues } from './fixtures';

const selectOption = async (listbox: HTMLElement, option: string) => {
  await waitFor(() => {
    userEvent.click(listbox);
    userEvent.click(screen.getByText(option));
  });
};

const expectOptionIsSelected = (listbox: HTMLElement, option: string) => {
  const selectedOption = within(listbox).getAllByRole('option');
  expect(selectedOption.length).toEqual(1);
  expect(selectedOption[0]).toHaveTextContent(option);
};

const expectOptionAvailability = async (
  listbox: HTMLElement,
  option: string,
  disabled: boolean
) => {
  await waitFor(() => userEvent.click(listbox));
  const selectedOptions = within(listbox).getAllByText(option).reverse();
  // its either two or one nodes, we only need last one
  const selectedOption = selectedOptions[0];

  if (disabled) {
    expect(selectedOption).toHaveAttribute('disabled');
  } else {
    expect(selectedOption).toBeEnabled();
  }

  expect(selectedOption).toHaveStyleRule(
    'cursor',
    disabled ? 'not-allowed' : 'pointer'
  );
  await waitFor(() => userEvent.click(listbox));
};

const renderComponent = (props: CustomParamsProps, defaults = {}) => {
  const Wrapper: React.FC = ({ children }) => {
    const methods = useForm({ defaultValues: defaults });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return render(
    <Wrapper>
      <CustomParams {...props} />
    </Wrapper>
  );
};

describe('CustomParams', () => {
  it('renders with props', () => {
    renderComponent({ isSubmitting: false });

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Add Custom Parameter');
  });

  it('has defaultValues when they are set', () => {
    renderComponent({ isSubmitting: false }, defaultValues);

    expect(
      screen.getByRole('option', { name: defaultValues.customParams[0].name })
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue(
      defaultValues.customParams[0].value
    );
  });

  describe('works with user inputs correctly', () => {
    beforeEach(() => {
      renderComponent({ isSubmitting: false });
    });

    it('button click creates custom param fieldset', async () => {
      const button = screen.getByRole('button');
      await waitFor(() => userEvent.click(button));

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();

      const textbox = screen.getByRole('textbox');
      expect(textbox).toBeInTheDocument();
    });

    it('can select option', async () => {
      const button = screen.getByRole('button');
      await waitFor(() => userEvent.click(button));
      const listbox = screen.getByRole('listbox');

      await selectOption(listbox, 'compression.type');
      expectOptionIsSelected(listbox, 'compression.type');
      await expectOptionAvailability(listbox, 'compression.type', true);

      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue(TOPIC_CUSTOM_PARAMS['compression.type']);
    });

    it('when selected option changes disabled options update correctly', async () => {
      const button = screen.getByRole('button');
      await waitFor(() => userEvent.click(button));

      const listbox = screen.getByRole('listbox');

      await selectOption(listbox, 'compression.type');
      expectOptionIsSelected(listbox, 'compression.type');
      await expectOptionAvailability(listbox, 'compression.type', true);

      await selectOption(listbox, 'delete.retention.ms');
      await expectOptionAvailability(listbox, 'delete.retention.ms', true);
      await expectOptionAvailability(listbox, 'compression.type', false);
    });

    it('multiple button clicks create multiple fieldsets', async () => {
      const button = screen.getByRole('button');
      await waitFor(() => userEvent.click(button));
      await waitFor(() => userEvent.click(button));
      await waitFor(() => userEvent.click(button));

      const listboxes = screen.getAllByRole('listbox');
      expect(listboxes.length).toBe(3);

      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBe(3);
    });

    it("can't select already selected option", async () => {
      const button = screen.getByRole('button');
      await waitFor(() => userEvent.click(button));
      await waitFor(() => userEvent.click(button));

      const listboxes = screen.getAllByRole('listbox');

      const firstListbox = listboxes[0];
      await selectOption(firstListbox, 'compression.type');
      await expectOptionAvailability(firstListbox, 'compression.type', true);

      const secondListbox = listboxes[1];
      await expectOptionAvailability(secondListbox, 'compression.type', true);
    });

    it('when fieldset with selected custom property type is deleted disabled options update correctly', async () => {
      const button = screen.getByRole('button');
      await waitFor(() => userEvent.click(button));
      await waitFor(() => userEvent.click(button));
      await waitFor(() => userEvent.click(button));

      const listboxes = screen.getAllByRole('listbox');

      const firstListbox = listboxes[0];
      await selectOption(firstListbox, 'compression.type');
      await expectOptionAvailability(firstListbox, 'compression.type', true);

      const secondListbox = listboxes[1];
      await selectOption(secondListbox, 'delete.retention.ms');
      await expectOptionAvailability(
        secondListbox,
        'delete.retention.ms',
        true
      );

      const thirdListbox = listboxes[2];
      await selectOption(thirdListbox, 'file.delete.delay.ms');
      await expectOptionAvailability(
        thirdListbox,
        'file.delete.delay.ms',
        true
      );

      const deleteSecondFieldsetButton = screen.getByTitle(
        'Delete customParam field 1'
      );
      await waitFor(() => userEvent.click(deleteSecondFieldsetButton));
      expect(secondListbox).not.toBeInTheDocument();

      await expectOptionAvailability(
        firstListbox,
        'delete.retention.ms',
        false
      );
      await expectOptionAvailability(
        thirdListbox,
        'delete.retention.ms',
        false
      );
    });
  });
});
