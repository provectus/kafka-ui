import React from 'react';
import { useFormContext, ErrorMessage } from 'react-hook-form';
import { CUSTOM_PARAMS_OPTIONS } from './customParamsOptions';
import { isFirstParam } from './CustomParams';

interface Props {
  isDisabled: boolean;
  index: string;
  name: string;
  defaultValue: string;
}

const CustomParamValue: React.FC<Props> = ({
  isDisabled,
  index,
  name,
  defaultValue,
}) => {

  const { register, unregister, errors, watch, setValue } = useFormContext();
  const selectInputName: string = `${index}[name]`;
  const valInputName: string    = `${index}[value]`;
  const selectedParamName = watch(selectInputName, name);

  React.useEffect(
    () => {
      if (selectedParamName) {
        setValue(valInputName, CUSTOM_PARAMS_OPTIONS[selectedParamName].defaultValue, true);
      }
    },
    [selectedParamName],
  );

  React.useEffect(
    () => { if (isFirstParam(index)) { unregister(valInputName) } },
  );

  return (
    <>
      <label className="label">Value</label>
      <input
        className="input"
        placeholder="Value"
        ref={register({
          required: 'Value is required.',
        })}
        name={valInputName}
        defaultValue={defaultValue}
        autoComplete="off"
        disabled={isDisabled}
      />
      <p className="help is-danger">
        <ErrorMessage errors={errors} name={valInputName}/>
      </p>
    </>
  );
};

export default React.memo(CustomParamValue);
