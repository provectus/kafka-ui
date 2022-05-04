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

    it('renders component', () => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('show select options when select is being clicked', () => {
      expect(screen.getByRole('option')).toBeInTheDocument();
      userEvent.click(screen.getByRole('listbox'));
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('checking select option change', () => {
      const listbox = screen.getByRole('listbox');
      const optionLabel = 'test-label1';

      userEvent.click(listbox);
      userEvent.selectOptions(listbox, [optionLabel]);

      expect(screen.getByRole('option')).toHaveTextContent(optionLabel);
    });

    it('trying to select disabled option does not trigger change', () => {
      const listbox = screen.getByRole('listbox');
      const normalOptionLabel = 'test-label1';
      const disabledOptionLabel = 'test-label2';

      userEvent.click(listbox);
      userEvent.selectOptions(listbox, [normalOptionLabel]);
      userEvent.click(listbox);
      userEvent.selectOptions(listbox, [disabledOptionLabel]);

      expect(screen.getByRole('option')).toHaveTextContent(normalOptionLabel);
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
      renderComponent({ isLive: true });
      expect(screen.getByTestId('liveIcon')).toBeInTheDocument();
    });
  });
});
