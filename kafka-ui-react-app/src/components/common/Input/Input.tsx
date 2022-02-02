import React from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import styled from 'styled-components';

import { InputIcon } from './InputIcon.styled';
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
  className,
  name,
  hookFormOptions,
  leftIcon,
  rightIcon,
  inputSize = 'L',
  ...rest
}) => {
  const methods = useFormContext();
  return (
    <div className={className}>
      {leftIcon && (
        <InputIcon className={leftIcon} position="left" inputSize={inputSize} />
      )}
      {name ? (
        <S.Input
          className={className}
          inputSize={inputSize}
          {...methods.register(name, { ...hookFormOptions })}
          hasLeftIcon={!!leftIcon}
          {...rest}
        />
      ) : (
        <S.Input
          className={className}
          inputSize={inputSize}
          hasLeftIcon={!!leftIcon}
          {...rest}
        />
      )}
      {rightIcon && (
        <InputIcon
          className={rightIcon}
          position="right"
          inputSize={inputSize}
        />
      )}
    </div>
  );
};

const InputWrapper = styled(Input)`
  position: relative;
`;

export default InputWrapper;
