import React from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';

import * as S from './Input.styled';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    Omit<S.InputProps, 'hasLeftIcon'> {
  name?: string;
  hookFormOptions?: RegisterOptions;
  leftIcon?: string;
  rightIcon?: string;
}

const Input: React.FC<InputProps> = ({
  name,
  hookFormOptions,
  leftIcon,
  rightIcon,
  inputSize = 'L',
  ...rest
}) => {
  const methods = useFormContext();
  return (
    <S.Wrapper>
      {leftIcon && (
        <S.InputIcon
          className={leftIcon}
          position="left"
          inputSize={inputSize}
        />
      )}
      {name ? (
        <S.Input
          inputSize={inputSize}
          {...methods.register(name, { ...hookFormOptions })}
          hasLeftIcon={!!leftIcon}
          {...rest}
        />
      ) : (
        <S.Input inputSize={inputSize} hasLeftIcon={!!leftIcon} {...rest} />
      )}
      {rightIcon && (
        <S.InputIcon
          className={rightIcon}
          position="right"
          inputSize={inputSize}
        />
      )}
    </S.Wrapper>
  );
};

export default Input;
