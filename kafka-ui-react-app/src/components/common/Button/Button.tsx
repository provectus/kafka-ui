import StyledButton, {
  ButtonProps,
} from 'components/common/Button/Button.styled';
import React from 'react';
import { Link } from 'react-router-dom';

interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonProps {
  isLink?: boolean;
  to?: string | object;
}

export const Button: React.FC<Props> = ({ isLink, to, ...props }) => {
  if (isLink) {
    return (
      <Link to={to}>
        <StyledButton {...props}>{props.children}</StyledButton>
      </Link>
    );
  }
  return <StyledButton {...props} />;
};
