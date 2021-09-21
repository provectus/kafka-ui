import { styled } from 'lib/themedStyles';
import React from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';

import LiveIcon from './LiveIcon.styled';
import StyledSelect from './Select.styled';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name?: string;
  hookFormOptions?: RegisterOptions;
  selectSize?: 'M' | 'L';
  isLive?: boolean;
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
    <div className={className}>
      {isLive && <LiveIcon selectSize={selectSize} />}
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
