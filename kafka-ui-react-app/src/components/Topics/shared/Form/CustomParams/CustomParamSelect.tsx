import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TopicConfigValue } from 'redux/interfaces';
import { ErrorMessage } from '@hookform/error-message';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';
import { INDEX_PREFIX } from './CustomParams';

export interface CustomParamSelectProps {
  isDisabled: boolean;
  index: string;
  name: string;
  existingFields: string[];
  onNameChange: (inputName: string, name: string) => void;
}

const CustomParamSelect: React.FC<CustomParamSelectProps> = ({
  isDisabled,
  index,
  name,
  existingFields,
  onNameChange,
}) => {
  const { register, errors, getValues, trigger } = useFormContext();
  const optInputName = `${index}[name]`;

  const selectedMustBeUniq = (selected: string) => {
    const values = getValues();
    const customParamsValues: TopicConfigValue = values.customParams;

    const valid = !Object.entries(customParamsValues).some(
      ([key, customParam]) => {
        return (
          `${INDEX_PREFIX}.${key}` !== index && selected === customParam.name
        );
      }
    );

    return valid || 'Custom Parameter must be unique';
  };

  const onChange = (inputName: string) => (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    trigger(inputName);
    onNameChange(index, event.target.value);
  };

  return (
    <>
      <label className="label">Custom Parameter</label>
      <div className="select is-block">
        <select
          name={optInputName}
          ref={register({
            required: 'Custom Parameter is required.',
            validate: { unique: (selected) => selectedMustBeUniq(selected) },
          })}
          onChange={onChange(optInputName)}
          disabled={isDisabled}
          defaultValue={name}
        >
          <option value="">Select</option>
          {Object.keys(TOPIC_CUSTOM_PARAMS).map((opt) => (
            <option
              key={opt}
              value={opt}
              disabled={existingFields.includes(opt)}
            >
              {opt}
            </option>
          ))}
        </select>
        <p className="help is-danger">
          <ErrorMessage errors={errors} name={optInputName} />
        </p>
      </div>
    </>
  );
};

export default React.memo(CustomParamSelect);
