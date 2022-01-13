import React, { ReactNode } from 'react';
import { useSelectContext } from 'components/contexts/SelectContext';

import * as S from './Select.styled';

const Option: React.FC<{
  children: ReactNode | ReactNode[];
  value: string | number;
  disabled?: boolean;
}> = ({ children, value, disabled }) => {
  const { changeSelectedOption } = useSelectContext();
  const handleOptionClick = () => {
    if (!disabled) {
      changeSelectedOption(value);
    }
  };

  return (
    <S.Option onClick={handleOptionClick} disabled={disabled} role="option" tabIndex={0}>
      {children}
    </S.Option>
  );
};

export default Option;
