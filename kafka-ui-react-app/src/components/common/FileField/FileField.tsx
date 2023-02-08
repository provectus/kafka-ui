import * as React from 'react';
import { FormError, InputHint } from 'components/common/Input/Input.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useFormContext } from 'react-hook-form';

interface FileFieldProps {
  name: string;
  label: React.ReactNode;
  hint?: string;
}
const FileField: React.FC<FileFieldProps> = ({ name, label, hint }) => {
  const id = React.useId();
  const { register } = useFormContext();
  return (
    <div>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <p>
        <input {...register(name)} type="file" id={id} />
      </p>
      <FormError>
        <ErrorMessage name={name} />
      </FormError>
      {hint && <InputHint>{hint}</InputHint>}
    </div>
  );
};

export default FileField;
