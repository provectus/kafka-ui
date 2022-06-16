import StyledButton, {
  ButtonProps,
} from 'components/common/Button/Button.styled';
import React from 'react';
import { Link } from 'react-router-dom';

interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonProps {
  to?: string | object;
}

export const Button: React.FC<Props> = ({ to, ...props }) => {
  if (to) {
    return (
      <Link to={to}>
        <StyledButton {...props}>{props.children}</StyledButton>
      </Link>
    );
  }
  return <StyledButton {...props} />;
};
