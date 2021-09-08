import StyledButton, {
  Props as ButtonProps,
} from 'components/common/Button/Button.styled';
import React from 'react';

type Props = ButtonProps;

export const Button: React.FC<Props> = (props) => {
  // Later we can add other logic here
  return <StyledButton {...props} />;
};
