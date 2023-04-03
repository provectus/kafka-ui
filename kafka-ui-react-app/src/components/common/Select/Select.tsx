import React, { useState, useRef } from 'react';
import useClickOutside from 'lib/hooks/useClickOutside';
import DropdownArrowIcon from 'components/common/Icons/DropdownArrowIcon';

import * as S from './Select.styled';
import LiveIcon from './LiveIcon.styled';

export interface SelectProps {
  options?: Array<SelectOption>;
  id?: string;
  name?: string;
  selectSize?: 'M' | 'L';
  isLive?: boolean;
  minWidth?: string;
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (option: string | number) => void;
  isThemeMode?: boolean;
}

export interface SelectOption {
  label: string | number | React.ReactElement;
  value: string | number;
  disabled?: boolean;
  isLive?: boolean;
}

const Select = React.forwardRef<HTMLUListElement, SelectProps>(
  (
    {
      options = [],
      value,
      defaultValue,
      selectSize = 'L',
      placeholder = '',
      isLive,
      disabled = false,
      onChange,
      isThemeMode,
      ...props
    },
    ref
  ) => {
    const [selectedOption, setSelectedOption] = useState(value);
    const [showOptions, setShowOptions] = useState(false);

    const showOptionsHandler = () => {
      if (!disabled) setShowOptions(!showOptions);
    };

    const selectContainerRef = useRef(null);
    const clickOutsideHandler = () => setShowOptions(false);
    useClickOutside(selectContainerRef, clickOutsideHandler);

    const updateSelectedOption = (option: SelectOption) => {
      if (!option.disabled) {
        setSelectedOption(option.value);

        if (onChange) {
          onChange(option.value);
        }

        setShowOptions(false);
      }
    };

    React.useEffect(() => {
      setSelectedOption(value);
    }, [isLive, value]);

    return (
      <div ref={selectContainerRef}>
        <S.Select
          role="listbox"
          selectSize={selectSize}
          isLive={isLive}
          disabled={disabled}
          onClick={showOptionsHandler}
          onKeyDown={showOptionsHandler}
          isThemeMode={isThemeMode}
          ref={ref}
          tabIndex={0}
          {...props}
        >
          <S.SelectedOptionWrapper>
            {isLive && <LiveIcon />}
            <S.SelectedOption
              role="option"
              tabIndex={0}
              isThemeMode={isThemeMode}
            >
              {options.find(
                (option) => option.value === (defaultValue || selectedOption)
              )?.label || placeholder}
            </S.SelectedOption>
          </S.SelectedOptionWrapper>
          {showOptions && (
            <S.OptionList>
              {options?.map((option) => (
                <S.Option
                  value={option.value}
                  key={option.value}
                  disabled={option.disabled}
                  onClick={() => updateSelectedOption(option)}
                  tabIndex={0}
                  role="option"
                >
                  {option.isLive && <LiveIcon />}
                  {option.label}
                </S.Option>
              ))}
            </S.OptionList>
          )}
          <DropdownArrowIcon isOpen={showOptions} />
        </S.Select>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
