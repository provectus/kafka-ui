import React from 'react';
import { Button } from 'components/common/Button/Button';
import { ButtonProps } from 'components/common/Button/Button.styled';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render } from '@testing-library/react';

describe('StyledButton', () => {
  it('should render with props S and Primary', () => {
    const buttonProps: ButtonProps = {
      buttonSize: 'S',
      buttonType: 'primary',
    };
    const Component = jest.fn((props) => (
      <ThemeProvider theme={theme}>
        <Button {...props} />
      </ThemeProvider>
    ));

    render(Component(buttonProps));
    expect(Component).toHaveBeenCalledWith(buttonProps);
  });

  it('should render with inverted theme colors', () => {
    const buttonProps = {
      buttonSize: 'S',
      buttonType: 'primary',
      isInverted: true,
    };
    const Component = jest.fn((props) => (
      <ThemeProvider theme={theme}>
        <Button {...props} />
      </ThemeProvider>
    ));
    render(Component(buttonProps));
    expect(Component).toHaveBeenCalledWith(buttonProps);
  });
});
