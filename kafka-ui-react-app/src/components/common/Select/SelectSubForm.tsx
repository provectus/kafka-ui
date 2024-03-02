import * as React from 'react';
import { ReactDatePickerProps } from 'react-datepicker';
import Input, { InputProps } from 'components/common/Input/Input';
import DatePicker from 'components/common/DatePicker/DatePicker';

export interface SelectSubFormProps {
  inputType: typeof Input | typeof DatePicker;
  inputProps?: InputProps | Omit<ReactDatePickerProps, 'onChange'>;
  value?: string | Date | null;
  onChange?(value: string | Date | null): void;
}

const SelectSubForm: React.FC<SelectSubFormProps> = ({
  inputType,
  inputProps,
  value,
  onChange,
}) => {
  if (typeof Input === typeof inputType)
    return (
      <Input
        {...(inputProps as InputProps)}
        value={value as string}
        onChange={({ target: { value: val } }) => onChange && onChange(val)}
      />
    );
  if (typeof DatePicker === typeof inputType)
    return (
      <DatePicker
        {...(inputProps as ReactDatePickerProps)}
        selected={value as Date}
        onChange={(date) => onChange && onChange(date as Date)}
      />
    );
  return null;
};

export default SelectSubForm;
