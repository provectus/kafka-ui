import { styled } from 'lib/themedStyles';
import React from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';

import LiveIcon from './LiveIcon.styled';
import StyledSelect from './Select.styled';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name?: string;
  selectSize?: 'M' | 'L';
  isLive?: boolean;
  hookFormOptions?: RegisterOptions;
}

const Select: React.FC<SelectProps> = ({
  className,
  children,
  selectSize = 'L',
  isLive,
  name,
  hookFormOptions,
  ...props
}) => {
  const methods = useFormContext();
  return (
    <div className={`select-wrapper ${className}`}>
      {isLive && <LiveIcon />}
      {name ? (
        <StyledSelect
          selectSize={selectSize}
          isLive={isLive}
          {...methods.register(name, { ...hookFormOptions })}
          {...props}
        >
          {children}
        </StyledSelect>
      ) : (
        <StyledSelect selectSize={selectSize} isLive={isLive} {...props}>
          {children}
        </StyledSelect>
      )}
    </div>
  );
};

export default styled(Select)`
  position: relative;
`;
