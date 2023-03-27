import StyledButton, {
  ButtonProps,
} from 'components/common/Button/Button.styled';
import React from 'react';
import { Link } from 'react-router-dom';
import * as S from 'components/common/Spinner/Spinner.styled';

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
    <StyledButton type="button" {...props}>
      {props.children}{' '}
      {props.inProgress ? (
        <S.Spinner
          role="progressbar"
          height={16}
          width={16}
          borderWidth={2}
          marginLeft={2}
          emptyBorderColor
        />
      ) : null}
    </StyledButton>
  );
};
