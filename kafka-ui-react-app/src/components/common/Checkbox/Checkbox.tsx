import * as React from 'react';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { FormError, InputHint } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';

export interface CheckboxProps {
  name: string;
  label: React.ReactNode;
  hint?: string;
  onChange?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ name, label, hint, onChange }, ref) => {
    return (
      <div>
        <InputLabel>
          <input type="checkbox" ref={ref} onChange={onChange} />
          {label}
        </InputLabel>
        <InputHint>{hint}</InputHint>
        <FormError>
          <ErrorMessage name={name} />
        </FormError>
      </div>
    );
  }
);

export default Checkbox;
