import StyledButton, {
  ButtonProps,
} from 'components/common/Button/Button.styled';
import React from 'react';
import { Link } from 'react-router-dom';

export interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonProps {
  to?: string | object;
}

export const Button: React.FC<Props> = ({ to, ...props }) => {
  if (to) {
    return (
      <Link to={to}>
        <StyledButton type="button" {...props}>
          {props.children}
        </StyledButton>
      </Link>
    );
  }
  return <StyledButton type="button" {...props} />;
};
