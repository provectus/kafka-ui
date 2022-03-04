import Select, { SelectProps } from 'components/common/Select/Select';
import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('react-hook-form', () => ({
  useFormContext: () => ({
    register: jest.fn(),
  }),
}));

const options = [
  { label: 'test-label1', value: 'test-value1' },
  { label: 'test-label2', value: 'test-value2' },
];

const renderComponent = (props?: Partial<SelectProps>) =>
  render(<Select name="test" {...props} />);

describe('Custom Select', () => {
  it('renders component', () => {
    renderComponent();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
  it('show select options when select is being clicked', () => {
    renderComponent({
      options,
    });
    expect(screen.getByRole('option')).toBeInTheDocument();
    userEvent.click(screen.getByRole('listbox'));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });
  it('checking select option change', () => {
    renderComponent({
      options,
    });
    userEvent.click(screen.getByRole('listbox'));
    userEvent.selectOptions(screen.getByRole('listbox'), ['test-label1']);
    expect(screen.getByRole('option')).toHaveTextContent('test-label1');
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
