import StyledButton, {
  ButtonProps,
} from 'components/common/Button/Button.styled';
import React from 'react';
import { Link } from 'react-router-dom';
import Spinner from 'components/common/Spinner/Spinner';

export interface Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonProps {
  to?: string | object;
  inProgress?: boolean;
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
  return (
    <StyledButton
      type="button"
      disabled={props.disabled || props.inProgress}
      {...props}
    >
      {props.children}{' '}
      {props.inProgress ? (
        <Spinner size={16} borderWidth={2} marginLeft={2} emptyBorderColor />
      ) : null}
    </StyledButton>
  );
};
