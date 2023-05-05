import React from 'react';
import { Controller } from 'react-hook-form';

import Input, { InputProps } from './Input';

const ControlledInput = ({
  name,
  control,
  ...restProps
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
InputProps & { control: any }) => {
  return (
    <Controller
      control={control}
      name={name ?? ''}
      render={({ field }) => <Input {...restProps} {...field} />}
    />
  );
};

export default ControlledInput;
