import React, { ReactNode, useState, useRef } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import useClickOutside from 'lib/hooks/useClickOutside';
import { SelectContext } from 'components/contexts/SelectContext';

import * as S from './Select.styled';
import LiveIcon from './LiveIcon.styled';

export interface SelectProps {
  children?: ReactNode | ReactNode[];
  id?: string;
  name?: string;
  selectSize?: 'M' | 'L';
  isLive?: boolean;
  hookFormOptions?: RegisterOptions;
  minWidth?: string;
  defaultValue?: string | number;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (option: string | number) => void;
}

export interface SelectOption {
  label: string | number;
  value: string | number;
}

const Select: React.FC<SelectProps> = ({
  children,
  defaultValue,
  value,
  selectSize = 'L',
  placeholder = '',
  isLive,
  name,
  hookFormOptions,
  disabled = false,
  required = false,
  onChange,
  ...props
}) => {
  const [selectedOption, setSelectedOption] = useState(
    value || defaultValue || ''
  );
  const [showOptions, setShowOptions] = useState(false);

  const showOptionsHandler = () => {
    if (!disabled) setShowOptions(!showOptions);
  };

  const selectContainerRef = useRef(null);
  const clickOutsideHandler = () => setShowOptions(false);
  useClickOutside(selectContainerRef, clickOutsideHandler);

  const updateSelectedOption = (option: string | number) => {
    if (disabled) return;

    setSelectedOption(option);
    if (onChange) onChange(option);
    setShowOptions(false);
  };

  const methods = useFormContext();

  return (
    <SelectContext.Provider
      value={{ selectedOption, changeSelectedOption: updateSelectedOption }}
    >
      <div ref={selectContainerRef}>
        {isLive && <LiveIcon />}
        {name ? (
          <S.Select
            role="listbox"
            selectSize={selectSize}
            isLive={isLive}
            disabled={disabled}
            onClick={showOptionsHandler}
            onKeyDown={showOptionsHandler}
            {...methods.register(name, { ...hookFormOptions })}
            {...props}
          >
            <S.SelectedOption role="option" tabIndex={0} >
              {String(selectedOption).length > 0 ? selectedOption : placeholder}
            </S.SelectedOption>
            {showOptions && (
              <S.OptionList selectSize={selectSize}>{children}</S.OptionList>
            )}
          </S.Select>
        ) : (
          <S.Select
            role="listbox"
            selectSize={selectSize}
            isLive={isLive}
            disabled={disabled}
            onClick={showOptionsHandler}
            onKeyDown={showOptionsHandler}
            {...props}
          >
            <S.SelectedOption role="option" tabIndex={0}>
              {String(selectedOption).length > 0 ? selectedOption : placeholder}
            </S.SelectedOption>
            {showOptions && (
              <S.OptionList selectSize={selectSize}>{children}</S.OptionList>
            )}
          </S.Select>
        )}
      </div>
    </SelectContext.Provider>
  );
};

export default Select;
