import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TopicConfig } from 'generated-sources';
import { ErrorMessage } from '@hookform/error-message';
import CUSTOM_PARAMS_OPTIONS from './customParamsOptions';

interface Props {
  isDisabled: boolean;
  index: string;
  name: TopicConfig['name'];
  defaultValue: TopicConfig['defaultValue'];
}

const CustomParamValue: React.FC<Props> = ({
  isDisabled,
  index,
  name,
  defaultValue,
}) => {
  const { register, errors, watch, setValue } = useFormContext();
  const selectInputName = `${index}[name]`;
  const valInputName = `${index}[value]`;
  const selectedParamName = watch(selectInputName, name);

  React.useEffect(() => {
    if (selectedParamName && !defaultValue) {
      setValue(
        valInputName,
        CUSTOM_PARAMS_OPTIONS[selectedParamName].defaultValue
      );
    }
  }, [selectedParamName, setValue, valInputName]);

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
        <ErrorMessage errors={errors} name={name} />
      </p>
    </>
  );
};

export default React.memo(CustomParamValue);
