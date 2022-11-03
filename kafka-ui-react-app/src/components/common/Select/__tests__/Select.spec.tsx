import Select, {
  SelectOption,
  SelectProps,
} from 'components/common/Select/Select';
import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('react-hook-form', () => ({
  useFormContext: () => ({
    register: jest.fn(),
  }),
}));

const options: Array<SelectOption> = [
  { label: 'test-label1', value: 'test-value1', disabled: false },
  { label: 'test-label2', value: 'test-value2', disabled: true },
];

const renderComponent = (props?: Partial<SelectProps>) =>
  render(<Select name="test" {...props} />);

describe('Custom Select', () => {
  describe('when isLive is not specified', () => {
    beforeEach(() => {
      renderComponent({
        options,
      });
    });

    const getListbox = () => screen.getByRole('listbox');
    const getOption = () => screen.getByRole('option');

    it('renders component', () => {
      expect(getListbox()).toBeInTheDocument();
    });

    it('show select options when select is being clicked', async () => {
      expect(getOption()).toBeInTheDocument();
      await userEvent.click(getListbox());
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('checking select option change', async () => {
      const optionLabel = 'test-label1';

      await userEvent.click(getListbox());
      await userEvent.selectOptions(getListbox(), [optionLabel]);

      expect(getOption()).toHaveTextContent(optionLabel);
    });

    it('trying to select disabled option does not trigger change', async () => {
      const normalOptionLabel = 'test-label1';
      const disabledOptionLabel = 'test-label2';

      await userEvent.click(getListbox());
      await userEvent.selectOptions(getListbox(), [normalOptionLabel]);
      await userEvent.click(getListbox());
      await userEvent.selectOptions(getListbox(), [disabledOptionLabel]);

      expect(getOption()).toHaveTextContent(normalOptionLabel);
    });
  });

  describe('when non-live', () => {
    it('there is not live icon', () => {
      renderComponent({ isLive: false });
      expect(screen.queryByTestId('liveIcon')).not.toBeInTheDocument();
    });
  });

  describe('when live', () => {
    it('there is live icon', () => {
      render(<Select name="test" {...{ isLive: true }} />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });
});
