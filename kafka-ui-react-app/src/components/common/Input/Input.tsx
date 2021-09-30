import React from 'react';
import { useFormContext } from 'react-hook-form';
import { styled } from 'lib/themedStyles';

import StyledIcon from './InputIcon.styled';
import StyledInput, { StyledInputProps } from './Input.styled';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    Omit<StyledInputProps, 'hasLeftIcon'> {
  name?: string;
  leftIcon?: string;
  rightIcon?: string;
}

const Input: React.FC<InputProps> = ({
  className,
  name,
  leftIcon,
  rightIcon,
  inputSize = 'L',
  ...rest
}) => {
  const methods = useFormContext();
  return (
    <div className={className}>
      {leftIcon && (
        <StyledIcon
          className={leftIcon}
          position="left"
          inputSize={inputSize}
        />
      )}
      {name ? (
        <StyledInput
          className={className}
          inputSize={inputSize}
          {...methods.register(name)}
          hasLeftIcon={!!leftIcon}
          {...rest}
        />
      ) : (
        <StyledInput
          className={className}
          inputSize={inputSize}
          hasLeftIcon={!!leftIcon}
          {...rest}
        />
      )}
      {rightIcon && (
        <StyledIcon
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
