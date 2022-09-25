import React from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import SearchIcon from 'components/common/Icons/SearchIcon';

import * as S from './Input.styled';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    Omit<S.InputProps, 'search'> {
  name?: string;
  hookFormOptions?: RegisterOptions;
  search?: boolean;
  positiveOnly?: boolean;
}

const Input: React.FC<InputProps> = ({
  name,
  hookFormOptions,
  search,
  inputSize = 'L',
  type,
  positiveOnly,
  ...rest
}) => {
  const methods = useFormContext();
  const keyPressEventHandler = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const { key, code } = event;
    if (type === 'number') {
      // Manualy prevent input of 'e' character for all number inputs
      // and prevent input of negative numbers for positiveOnly inputs
      if (key === 'e' || (positiveOnly && (key === '-' || code === 'Minus'))) {
        event.preventDefault();
      }
    }
  };
  const pasteEventHandler = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const { clipboardData } = event;
      const text = clipboardData.getData('Text');
      // replace all non-digit characters with empty string
      let value = text.replace(/[^\d.]/g, '');
      if (positiveOnly) {
        // check if value is negative
        const parsedData = parseFloat(value);
        if (parsedData < 0) {
          // remove minus sign
          value = String(Math.abs(parsedData));
        }
      }
      // if paste value contains non-numeric characters or
      // negative for positiveOnly fields then prevent paste
      if (value !== text) {
        event.preventDefault();

        // for react-hook-form fields only set transformed value
        if (name) {
          methods.setValue(name, value);
        }
      }
    }
  };

  let inputOptions = { ...rest };
  if (name) {
    // extend input options with react-hook-form options
    // if the field is a part of react-hook-form form
    inputOptions = { ...rest, ...methods.register(name, hookFormOptions) };
  }

  return (
    <S.Wrapper>
      {search && <SearchIcon />}
      <S.Input
        inputSize={inputSize}
        search={!!search}
        type={type}
        onKeyPress={keyPressEventHandler}
        onPaste={pasteEventHandler}
        {...inputOptions}
      />
    </S.Wrapper>
  );
};

export default Input;
