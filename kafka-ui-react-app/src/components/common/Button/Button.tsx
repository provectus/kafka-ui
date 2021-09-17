import StyledButton, {
  ButtonProps,
} from 'components/common/Button/Button.styled';
import React from 'react';

interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonProps {}

export const Button: React.FC<Props> = (props) => {
  return <StyledButton {...props} />;
};
