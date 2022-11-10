import React from 'react';
import { Button, Props as ButtonProps } from 'components/common/Button/Button';

import * as S from './ActionButton.styled';

interface Props extends ButtonProps {
  canDoAction: boolean;
}

const ActionButton: React.FC<Props> = ({ canDoAction, disabled, ...props }) => {
  return (
    <S.Wrapper>
      <Button {...props} disabled={disabled || !canDoAction} />
    </S.Wrapper>
  );
};

export default ActionButton;
