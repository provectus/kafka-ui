import StyledButton, {
  ButtonProps,
} from 'components/common/Button/Button.styled';
import React from 'react';

type Props = ButtonProps;

export const Button: React.FC<Props> = (props) => {
  return <StyledButton {...props} />;
};
