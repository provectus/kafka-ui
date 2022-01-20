import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import CustomParams, {
  CustomParamsProps,
} from 'components/Topics/shared/Form/CustomParams/CustomParams';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';

const selectOption = async (listbox: HTMLElement, option: string) => {
  await waitFor(() => userEvent.click(listbox));
  await waitFor(() => userEvent.click(screen.getByText(option)));
};

const expectOptionIsSelected = (listbox: HTMLElement, option: string) => {
  const selectedOption = within(listbox).getAllByRole('option');
  expect(selectedOption.length).toEqual(1);
  expect(selectedOption[0]).toHaveTextContent(option);
};

const expectOptionIsDisabled = async (
  listbox: HTMLElement,
  option: string,
  disabled: boolean
) => {
  await waitFor(() => userEvent.click(listbox));
  const selectedOption = within(listbox).getAllByText(option);
  expect(selectedOption[1]).toHaveStyleRule(
    'cursor',
    disabled ? 'not-allowed' : 'pointer'
  );
};

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
    it('button click creates custom param fieldset', async () => {
      const addParamButton = screen.getByRole('button');
      await waitFor(() => userEvent.click(addParamButton));

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();

      const textbox = screen.getByRole('textbox');
      expect(textbox).toBeInTheDocument();
    });

    it('can select option', async () => {
      const addParamButton = screen.getByRole('button');
      await waitFor(() => userEvent.click(addParamButton));

      const listbox = screen.getByRole('listbox');

      await selectOption(listbox, 'compression.type');
      expectOptionIsSelected(listbox, 'compression.type');
      expectOptionIsDisabled(listbox, 'compression.type', true);

      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue(TOPIC_CUSTOM_PARAMS['compression.type']);
    });

    it('when selected option changes disabled options update correctly', async () => {
      const addParamButton = screen.getByRole('button');
      await waitFor(() => userEvent.click(addParamButton));

      const listbox = screen.getByRole('listbox');

      await selectOption(listbox, 'compression.type');
      expectOptionIsDisabled(listbox, 'compression.type', true);

      await selectOption(listbox, 'delete.retention.ms');
      expectOptionIsDisabled(listbox, 'delete.retention.ms', true);
      expectOptionIsDisabled(listbox, 'compression.type', false);
    });

    it('multiple button clicks create multiple fieldsets', async () => {
      const addParamButton = screen.getByRole('button');
      await waitFor(() => userEvent.click(addParamButton));
      await waitFor(() => userEvent.click(addParamButton));
      await waitFor(() => userEvent.click(addParamButton));

      const listboxes = screen.getAllByRole('listbox');
      expect(listboxes.length).toBe(3);

      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBe(3);
    });

    it("can't select already selected option", async () => {
      const addParamButton = screen.getByRole('button');
      userEvent.click(addParamButton);
      userEvent.click(addParamButton);

      const listboxes = screen.getAllByRole('listbox');

      const firstListbox = listboxes[0];
      await selectOption(firstListbox, 'compression.type');
      expectOptionIsDisabled(firstListbox, 'compression.type', true);

      const secondListbox = listboxes[1];
      expectOptionIsDisabled(secondListbox, 'compression.type', true);
    });

    it('when fieldset with selected custom property type is deleted disabled options update correctly', async () => {
      const addParamButton = screen.getByRole('button');
      userEvent.click(addParamButton);
      userEvent.click(addParamButton);
      userEvent.click(addParamButton);

      const listboxes = screen.getAllByRole('listbox');

      const firstListbox = listboxes[0];
      await selectOption(firstListbox, 'compression.type');
      expectOptionIsDisabled(firstListbox, 'compression.type', true);

      const secondListbox = listboxes[1];
      await selectOption(secondListbox, 'delete.retention.ms');
      expectOptionIsDisabled(secondListbox, 'delete.retention.ms', true);

      const thirdListbox = listboxes[2];
      await selectOption(thirdListbox, 'file.delete.delay.ms');
      expectOptionIsDisabled(thirdListbox, 'file.delete.delay.ms', true);

      const deleteSecondFieldsetButton = screen.getByTitle(
        'Delete customParam field 1'
      );
      userEvent.click(deleteSecondFieldsetButton);
      expect(secondListbox).not.toBeInTheDocument();

      expectOptionIsDisabled(firstListbox, 'delete.retention.ms', false);
      expectOptionIsDisabled(thirdListbox, 'delete.retention.ms', false);
    });
  });
});
