import React from 'react';

import * as S from './Switch.styled';

interface SwitchProps {
  onChange(): void;
  checked: boolean;
  name: string;
}

const Switch: React.FC<SwitchProps> = ({ name, checked, onChange }) => {
  return (
    <S.StyledLabel>
      <S.StyledInput
        name={name}
        type="checkbox"
        onChange={onChange}
        checked={checked}
      />
      <S.StyledSlider />
    </S.StyledLabel>
  );
};

export default Switch;
