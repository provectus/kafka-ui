import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TopicConfig } from 'generated-sources';
import { ErrorMessage } from '@hookform/error-message';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';

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
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const selectInputName = `${index}[name]`;
  const valInputName = `${index}[value]`;
  const selectedParamName = watch(selectInputName, name);

  React.useEffect(() => {
    if (selectedParamName && !defaultValue) {
      setValue(valInputName, TOPIC_CUSTOM_PARAMS[selectedParamName]);
    }
  }, [selectedParamName, setValue, valInputName]);

  return (
    <>
      <label className="label">Value</label>
      <input
        className="input"
        placeholder="Value"
        {...register(valInputName, {
          required: 'Value is required.',
        })}
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
