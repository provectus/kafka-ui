import React from 'react';
import { Button } from 'components/common/Button/Button';
import { ButtonProps } from 'components/common/Button/Button.styled';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render, screen } from '@testing-library/react';

describe('StyledButton', () => {
  it('should be in the document', () => {
    const buttonProps: ButtonProps = {
      buttonSize: 'S',
      buttonType: 'primary',
    };
    const Component = (
      <ThemeProvider theme={theme}>
        <Button {...buttonProps} />
      </ThemeProvider>
    );

    render(Component);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
