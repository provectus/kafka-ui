import React from 'react';

import * as S from './Switch.styled';

export interface SwitchProps {
  onChange(): void;
  checked: boolean;
  name: string;
  checkedIcon?: React.ReactNode;
  unCheckedIcon?: React.ReactNode;
  bgCustomColor?: string;
}
const Switch: React.FC<SwitchProps> = ({
  name,
  checked,
  onChange,
  checkedIcon,
  unCheckedIcon,
}) => {
  const isCheckedIcon = !!(checkedIcon || unCheckedIcon);
  return (
    <S.StyledLabel isCheckedIcon={isCheckedIcon}>
      <S.StyledInput
        name={name}
        type="checkbox"
        onChange={onChange}
        checked={checked}
        isCheckedIcon={isCheckedIcon}
      />
      <S.StyledSlider isCheckedIcon={isCheckedIcon} />
      {checkedIcon && <S.CheckedIcon>{checkedIcon}</S.CheckedIcon>}
      {unCheckedIcon && <S.UnCheckedIcon>{unCheckedIcon}</S.UnCheckedIcon>}
    </S.StyledLabel>
  );
};

export default Switch;
