import React from 'react';
import { Controller } from 'react-hook-form';

import Checkbox, { CheckboxProps } from './Checkbox';

const ControlledCheckbox = ({ name, label, hint }: CheckboxProps) => {
  return (
    <Controller
      name={name}
      render={({ field }) => <Checkbox label={label} hint={hint} {...field} />}
    />
  );
};

export default ControlledCheckbox;
