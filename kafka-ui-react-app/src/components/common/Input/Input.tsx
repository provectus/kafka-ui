import React from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import SearchIcon from 'components/common/Icons/SearchIcon';
import { ErrorMessage } from '@hookform/error-message';

import * as S from './Input.styled';
import { InputLabel } from './InputLabel.styled';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    Omit<S.InputProps, 'search'> {
  name?: string;
  hookFormOptions?: RegisterOptions;
  search?: boolean;
  positiveOnly?: boolean;
  withError?: boolean;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  clearIcon?: React.ReactNode;

  // Some may only accept integer, like `Number of Partitions`
  // some may accept decimal
  integerOnly?: boolean;
}

function inputNumberCheck(
  key: string,
  positiveOnly: boolean,
  integerOnly: boolean,
  getValues: (name: string) => string,
  componentName: string
) {
  let isValid = true;
  if (!((key >= '0' && key <= '9') || key === '-' || key === '.')) {
    // If not a valid digit char.
    isValid = false;
  } else {
    // If there is any restriction.
    if (positiveOnly) {
      isValid = !(key === '-');
    }
    if (isValid && integerOnly) {
      isValid = !(key === '.');
    }

    // Check invalid format
    const value = getValues(componentName);

    if (isValid && (key === '-' || key === '.')) {
      if (!positiveOnly) {
        if (key === '-') {
          if (value !== '') {
            // '-' should not appear anywhere except the start of the string
            isValid = false;
          }
        }
      }
      if (!integerOnly) {
        if (key === '.') {
          if (value === '' || value.indexOf('.') !== -1) {
            // '.' should not appear at the start of the string or appear twice
            isValid = false;
          }
        }
      }
    }
  }
  return isValid;
}

function pasteNumberCheck(
  text: string,
  positiveOnly: boolean,
  integerOnly: boolean
) {
  let value: string;
  value = text;
  let sign = '';
  if (!positiveOnly) {
    if (value.charAt(0) === '-') {
      sign = '-';
    }
  }
  if (integerOnly) {
    value = value.replace(/\D/g, '');
  } else {
    value = value.replace(/[^\d.]/g, '');
    if (value.indexOf('.') !== value.lastIndexOf('.')) {
      const strs = value.split('.');
      value = '';
      for (let i = 0; i < strs.length; i += 1) {
        value += strs[i];
        if (i === 0) {
          value += '.';
        }
      }
    }
  }
  value = sign + value;
  return value;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    name,
    hookFormOptions,
    search,
    inputSize = 'L',
    type,
    positiveOnly,
    integerOnly,
    withError = false,
    label,
    hint,
    clearIcon,
    ...rest
  } = props;

  const methods = useFormContext();

  const fieldId = React.useId();

  const isHookFormField = !!name && !!methods.register;

  const keyPressEventHandler = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const { key } = event;
    if (type === 'number') {
      // Manually prevent input of non-digit and non-minus for all number inputs
      // and prevent input of negative numbers for positiveOnly inputs
      if (
        !inputNumberCheck(
          key,
          typeof positiveOnly === 'boolean' ? positiveOnly : false,
          typeof integerOnly === 'boolean' ? integerOnly : false,
          methods.getValues,
          typeof name === 'string' ? name : ''
        )
      ) {
        event.preventDefault();
      }
    }
  };
  const pasteEventHandler = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const { clipboardData } = event;
      // The 'clipboardData' does not have key 'Text', but has key 'text' instead.
      const text = clipboardData.getData('text');
      // Check the format of pasted text.
      const value = pasteNumberCheck(
        text,
        typeof positiveOnly === 'boolean' ? positiveOnly : false,
        typeof integerOnly === 'boolean' ? integerOnly : false
      );
      // if paste value contains non-numeric characters or
      // negative for positiveOnly fields then prevent paste
      if (value !== text) {
        event.preventDefault();

        // for react-hook-form fields only set transformed value
        if (isHookFormField) {
          methods.setValue(name, value);
        }
      }
    }
  };

  let inputOptions = { ...rest };
  if (isHookFormField) {
    // extend input options with react-hook-form options
    // if the field is a part of react-hook-form form
    inputOptions = { ...rest, ...methods.register(name, hookFormOptions) };
  }
  return (
    <div>
      {label && <InputLabel htmlFor={rest.id || fieldId}>{label}</InputLabel>}
      <S.Wrapper>
        {search && <SearchIcon />}
        <S.Input
          id={fieldId}
          inputSize={inputSize}
          search={!!search}
          type={type}
          onKeyPress={keyPressEventHandler}
          onPaste={pasteEventHandler}
          ref={ref}
          {...inputOptions}
        />
        {clearIcon}

        {withError && isHookFormField && (
          <S.FormError>
            <ErrorMessage name={name} />
          </S.FormError>
        )}
        {hint && <S.InputHint>{hint}</S.InputHint>}
      </S.Wrapper>
    </div>
  );
});

export default Input;
