import styled from 'styled-components';
import React from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';

import LiveIcon from './LiveIcon.styled';
import * as S from './Select.styled';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name?: string;
  selectSize?: 'M' | 'L';
  isLive?: boolean;
  hookFormOptions?: RegisterOptions;
  minWidth?: string;
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
        <S.Select
          role="listbox"
          selectSize={selectSize}
          isLive={isLive}
          {...methods.register(name, { ...hookFormOptions })}
          {...props}
        >
          {children}
        </S.Select>
      ) : (
        <S.Select
          role="listbox"
          selectSize={selectSize}
          isLive={isLive}
          {...props}
        >
          {children}
        </S.Select>
      )}
    </div>
  );
};

export default styled(Select)`
  position: relative;
`;
