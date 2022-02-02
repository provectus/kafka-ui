import React from 'react';
import { Button } from 'components/common/Button/Button';
import { ButtonProps } from 'components/common/Button/Button.styled';
import { mountWithTheme } from 'lib/testHelpers';

describe('StyledButton', () => {
  const setupComponent = (props: ButtonProps) =>
    mountWithTheme(<Button {...props} />);

  it('should render with props S and Primary', () => {
    const wrapper = setupComponent({
      buttonSize: 'S',
      buttonType: 'primary',
    });
    expect(wrapper.exists()).toBeTruthy();
  });

  it('should render with inverted theme colors', () => {
    const wrapper = setupComponent({
      buttonSize: 'S',
      buttonType: 'primary',
      isInverted: true,
    });
    expect(wrapper.exists()).toBeTruthy();
  });
});
