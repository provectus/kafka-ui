import styled from 'styled-components';
import React, { ChangeEvent, useState } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';

import LiveIcon from './LiveIcon.styled';
import * as S from './Select.styled';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLDivElement> {
  name?: string;
  selectSize?: 'M' | 'L';
  isLive?: boolean;
  hookFormOptions?: RegisterOptions;
  minWidth?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
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
  const [isOpen, setIsOpen] = useState(false);

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
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen && (
            <S.OptionList selectSize={selectSize}>{children}</S.OptionList>
          )}
        </S.Select>
      ) : (
        <S.Select selectSize={selectSize} isLive={isLive} {...props} onClick={() => setIsOpen(!isOpen)}>
          {isOpen && (
            <S.OptionList selectSize={selectSize}>{children}</S.OptionList>
          )}
        </S.Select>
      )}
    </div>
  );
};

export default Select;
