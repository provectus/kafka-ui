import React from 'react';
import { screen, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import CustomParams, {
  CustomParamsProps,
} from 'components/Topics/shared/Form/CustomParams/CustomParams';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

// https://github.com/react-hook-form/react-hook-form/discussions/3815
describe('CustomParams', () => {
  const setupComponent = (props: CustomParamsProps) => {
    const Wrapper: React.FC = ({ children }) => {
      const methods = useForm();
      return <FormProvider {...methods}>{children}</FormProvider>;
    };

    render(
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
      expect(textbox).toHaveValue('producer');
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
      userEvent.selectOptions(secondListbox, ['compression.type']);
    });

    // it('multiple button clicks create multiple fieldsets', () => {
    //   const addParamButton = screen.getByRole('button');
    //   userEvent.click(addParamButton);
    //   userEvent.click(addParamButton);
    //   userEvent.click(addParamButton);

    //   const listboxes = screen.getAllByRole('listbox');

    //   const firstListbox = listboxes[0];
    //   userEvent.selectOptions(firstListbox, ['compression.type']);
    //   const option = screen.getByRole('option', {
    //     selected: true,
    //   });
    //   expect(option).toHaveValue('compression.type');
    //   expect(option).toBeDisabled();

    //   const textbox = screen.getByRole('textbox');
    //   expect(textbox).toHaveValue('producer');

    //   const secondListbox = listboxes[1];
    //   const thirdListbox = listboxes[2];

    //   const textboxes = screen.getAllByRole('textbox');
    //   expect(textboxes.length).toBe(3);
    // });
  });
});
