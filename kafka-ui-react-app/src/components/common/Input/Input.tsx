import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';

import StyledIcon from './InputIcon.styled';
import StyledInput from './Input.styled';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string;
  hookFormOptions?: RegisterOptions;
  inputSize?: 'M' | 'L';
  leftIcon?: string;
  rightIcon?: string;
}

const Input: React.FC<InputProps> = ({
  className,
  name,
  hookFormOptions,
  leftIcon,
  rightIcon,
  inputSize,
  ...rest
}) => {
  const size = inputSize || 'L'; // default size is L
  const methods = useFormContext();
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      {leftIcon && (
        <StyledIcon className={leftIcon} position="left" inputSize={size} />
      )}
      {name ? (
        <StyledInput
          className={className}
          inputSize={size}
          {...methods.register(name, { ...hookFormOptions })}
          hasLeftIcon={!!leftIcon}
          {...rest}
        />
      ) : (
        <StyledInput
          className={className}
          inputSize={size}
          hasLeftIcon={!!leftIcon}
          {...rest}
        />
      )}
      {rightIcon && (
        <StyledIcon className={rightIcon} position="right" inputSize={size} />
      )}
    </div>
  );
};

export default Input;
