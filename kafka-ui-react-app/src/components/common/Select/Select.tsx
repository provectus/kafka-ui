import React, { useState, useRef } from 'react';
import useClickOutside from 'lib/hooks/useClickOutside';
import DropdownArrowIcon from 'components/common/Icons/DropdownArrowIcon';
import { Button } from 'components/common/Button/Button';

import * as S from './Select.styled';
import LiveIcon from './LiveIcon.styled';
import SelectSubForm, { SelectSubFormProps } from './SelectSubForm';

export interface SelectProps {
  options?: Array<SelectOption>;
  id?: string;
  name?: string;
  selectSize?: 'M' | 'L';
  isLive?: boolean;
  minWidth?: string;
  optionsMaxHeight?: string;
  optionsOrientation?: 'L' | 'R';
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (
    option: string | number,
    subFormValue?: string | Date | null
  ) => void;
  isThemeMode?: boolean;
}

export interface SelectOption {
  label: string | number | React.ReactElement;
  value: string | number;
  disabled?: boolean;
  isLive?: boolean;
  subFormProps?: SelectSubFormProps;
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
    const getSelectedOption = (val: string | number | undefined) => {
      return options.find((option) => option.value === val);
    };

    const [selectedOption, setSelectedOption] = useState(
      getSelectedOption(value)
    );
    const [showOptions, setShowOptions] = useState(false);
    const [showSubForm, setShowSubForm] = useState(false);
    const [subFormValue, setSubFormValue] = useState<string | Date | null>();

    const showOptionsHandler = () => {
      if (!disabled) setShowOptions(!showOptions);
    };

    const selectContainerRef = useRef(null);
    const clickOutsideHandler = () => {
      setShowSubForm(false);
      setShowOptions(false);
    };
    useClickOutside(selectContainerRef, clickOutsideHandler);

    const updateSelectedOption = (
      option: SelectOption,
      formVal?: string | Date | null
    ) => {
      if (!option.disabled) {
        setSelectedOption(option);
        setShowOptions(false);
        setShowSubForm(false);

        if (onChange) {
          onChange(option.value, formVal);
        }
      }
    };

    const handleShowSubForm = (
      option: SelectOption,
      event: React.MouseEvent<HTMLLIElement, MouseEvent>
    ) => {
      if (!option.disabled) {
        setSubFormValue(undefined);
        setShowSubForm(true);
        setSelectedOption(option);
        event.stopPropagation();
      }
    };

    React.useEffect(() => {
      setSelectedOption(getSelectedOption(value));
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
              {getSelectedOption(defaultValue)?.label ||
                selectedOption?.label ||
                placeholder}
            </S.SelectedOption>
          </S.SelectedOptionWrapper>
          {showOptions && (
            <S.OptionListWrapper
              maxHeight={props.optionsMaxHeight}
              orientation={props.optionsOrientation}
            >
              <S.OptionList>
                {options?.map((option) => (
                  <S.Option
                    value={option.value}
                    key={option.value}
                    disabled={option.disabled}
                    onClick={(event) =>
                      option.subFormProps
                        ? handleShowSubForm(option, event)
                        : updateSelectedOption(option)
                    }
                    tabIndex={0}
                    role="option"
                  >
                    {option.isLive && <LiveIcon />}
                    {option.label}
                  </S.Option>
                ))}
              </S.OptionList>
              {showSubForm && selectedOption?.subFormProps && (
                <S.SubFormContainer
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <S.SubFormWrapper>
                    <SelectSubForm
                      {...selectedOption.subFormProps}
                      value={subFormValue}
                      onChange={setSubFormValue}
                    />
                  </S.SubFormWrapper>
                  <S.ApplyButtonWrapper>
                    <Button
                      buttonSize="M"
                      buttonType="primary"
                      onClick={() =>
                        updateSelectedOption(selectedOption, subFormValue)
                      }
                    >
                      Apply
                    </Button>
                  </S.ApplyButtonWrapper>
                </S.SubFormContainer>
              )}
            </S.OptionListWrapper>
          )}
          <DropdownArrowIcon isOpen={showOptions} />
        </S.Select>
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
