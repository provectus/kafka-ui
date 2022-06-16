import React from 'react';
import { render } from 'lib/testHelpers';
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';
import { ISelectProps } from 'react-multi-select-component/dist/lib/interfaces';

const Option1 = { value: 1, label: 'option 1' };
const Option2 = { value: 2, label: 'option 2' };

interface IMultiSelectProps extends ISelectProps {
  minWidth?: string;
}

const DefaultProps: IMultiSelectProps = {
  options: [Option1, Option2],
  labelledBy: 'multi-select',
  value: [Option1, Option2],
};

describe('MultiSelect.Styled', () => {
  const setUpComponent = (props: IMultiSelectProps = DefaultProps) => {
    const { container } = render(<MultiSelect {...props} />);
    const multiSelect = container.firstChild;
    const dropdownContainer = multiSelect?.firstChild?.firstChild;

    return { container, multiSelect, dropdownContainer };
  };

  it('should have 200px minWidth by default', () => {
    const { container } = setUpComponent();
    const multiSelect = container.firstChild;

    expect(multiSelect).toHaveStyle('min-width: 200px');
  });

  it('should have the provided minWidth in styles', () => {
    const minWidth = '400px';
    const { container } = setUpComponent({ ...DefaultProps, minWidth });
    const multiSelect = container.firstChild;

    expect(multiSelect).toHaveStyle(`min-width: ${minWidth}`);
  });

  describe('when not disabled', () => {
    it('should have cursor pointer', () => {
      const { dropdownContainer } = setUpComponent();

      expect(dropdownContainer).toHaveStyle(`cursor: pointer`);
    });
  });

  describe('when disabled', () => {
    it('should have cursor not-allowed', () => {
      const { dropdownContainer } = setUpComponent({
        ...DefaultProps,
        disabled: true,
      });

      expect(dropdownContainer).toHaveStyle(`cursor: not-allowed`);
    });
  });
});
