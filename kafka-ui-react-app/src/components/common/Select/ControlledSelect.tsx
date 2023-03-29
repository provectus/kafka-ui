import * as React from 'react';
import { Controller } from 'react-hook-form';
import { FormError } from 'components/common/Input/Input.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { ErrorMessage } from '@hookform/error-message';

import Select, { SelectOption } from './Select';

interface ControlledSelectProps {
  name: string;
  label: React.ReactNode;
  hint?: string;
  options: SelectOption[];
  onChange?: (val: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ControlledSelect: React.FC<ControlledSelectProps> = ({
  name,
  label,
  onChange,
  options,
  disabled = false,
  placeholder,
}) => {
  const id = React.useId();

  return (
    <div>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Controller
        name={name}
        render={({ field }) => {
          return (
            <Select
              id={id}
              name={field.name}
              minWidth="270px"
              onChange={(value) => {
                if (onChange) onChange(value);
                field.onChange(value);
              }}
              value={field.value}
              options={options}
              placeholder={placeholder}
              disabled={disabled}
              ref={field.ref}
            />
          );
        }}
      />
      <FormError>
        <ErrorMessage name={name} />
      </FormError>
    </div>
  );
};

export default ControlledSelect;
