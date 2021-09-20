import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';

import LiveIcon from './LiveIcon.styled';
import StyledSelect from './Select.styled';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name?: string;
  hookFormOptions?: RegisterOptions;
  selectSize?: 'M' | 'L';
  isLive?: boolean;
}

const Select: React.FC<Props> = ({
  children,
  selectSize,
  isLive,
  name,
  hookFormOptions,
  ...props
}) => {
  const size = selectSize || 'L'; // default size
  const methods = useFormContext();
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      {isLive && <LiveIcon selectSize={size} />}
      {name ? (
        <StyledSelect
          selectSize={size}
          isLive={isLive}
          {...methods.register(name, { ...hookFormOptions })}
          {...props}
        >
          {children}
        </StyledSelect>
      ) : (
        <StyledSelect selectSize={size} isLive={isLive} {...props}>
          {children}
        </StyledSelect>
      )}
    </div>
  );
};

export default Select;
