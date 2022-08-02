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
          {...rest}
        />
      ) : (
        <S.Input inputSize={inputSize} hasLeftIcon={!!search} {...rest} />
      )}
    </S.Wrapper>
  );
};

export default Input;
