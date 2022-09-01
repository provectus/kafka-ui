import React from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import SearchIcon from 'components/common/Icons/SearchIcon';

import * as S from './Input.styled';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    Omit<S.InputProps, 'hasLeftIcon'> {
  name?: string;
  hookFormOptions?: RegisterOptions;
  search?: boolean;
}

const Input: React.FC<InputProps> = ({
  name,
  hookFormOptions,
  search,
  inputSize = 'L',
  type,
  ...rest
}) => {
  const methods = useFormContext();
  return (
    <S.Wrapper>
      {search && <SearchIcon />}
      {name ? (
        <S.Input
          inputSize={inputSize}
          {...methods.register(name, { ...hookFormOptions })}
          hasLeftIcon={!!search}
          type={type}
          {...rest}
          onKeyDown={(e) => {
            if (type === 'number') {
              if (e.key === 'e') {
                e.preventDefault();
              }
            }
          }}
          onPaste={(e) => {
            if (type === 'number') {
              e.preventDefault();
              const value = e.clipboardData.getData('Text');
              methods.setValue(name, value.replace(/[^\d.]/g, ''));
            }
          }}
        />
      ) : (
        <S.Input
          inputSize={inputSize}
          hasLeftIcon={!!search}
          type={type}
          {...rest}
        />
      )}
    </S.Wrapper>
  );
};

export default Input;
