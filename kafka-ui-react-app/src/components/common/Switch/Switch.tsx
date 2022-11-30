import React from 'react';

import * as S from './Switch.styled';

export interface SwitchProps {
  onChange(): void;
  checked: boolean;
  name: string;
  checkedIcon?: JSX.Element;
  unCheckedIcon?: JSX.Element;
}
const Switch: React.FC<SwitchProps> = ({
  name,
  checked,
  onChange,
  checkedIcon,
  unCheckedIcon,
}) => {
  return (
    <S.StyledLabel>
      <S.StyledInput
        name={name}
        type="checkbox"
        onChange={onChange}
        checked={checked}
      />
      <S.StyledSlider />
      <S.CheckedIcon>{checkedIcon}</S.CheckedIcon>
      <S.UnCheckedIcon>{unCheckedIcon}</S.UnCheckedIcon>
    </S.StyledLabel>
  );
};

export default Switch;
