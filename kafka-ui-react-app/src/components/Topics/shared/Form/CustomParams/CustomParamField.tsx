import React from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';
import { FieldArrayWithId, useFormContext } from 'react-hook-form';
import { remove as _remove } from 'lodash';
import { TopicFormData } from 'redux/interfaces';

import CustomParamButton from './CustomParamButton';

interface Props {
  isDisabled: boolean;
  index: number;
  existingFields: string[];
  field: FieldArrayWithId<TopicFormData, 'customParams', 'id'>;
  remove: (index?: number | number[] | undefined) => void;
  setExistingFields: React.Dispatch<React.SetStateAction<string[]>>;
}

const CustomParamField: React.FC<Props> = ({
  field,
  isDisabled,
  index,
  remove,
  existingFields,
  setExistingFields,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<TopicFormData>();
  const nameValue = watch(`customParams.${index}.name`);
  let prevName = '';

  React.useEffect(() => {
    prevName = nameValue;
  }, []);

  React.useEffect(() => {
    if (nameValue !== prevName) {
      let newExistingFields = [...existingFields];
      if (prevName) {
        newExistingFields = _remove(newExistingFields, (el) => el === prevName);
      }
      prevName = nameValue;
      newExistingFields.push(nameValue);
      setExistingFields(newExistingFields);
      setValue(`customParams.${index}.value`, TOPIC_CUSTOM_PARAMS[nameValue]);
    }
  }, [nameValue]);

  return (
    <div className="columns is-centered">
      <div className="column">
        <label className="label">Custom Parameter</label>
        <div className="select is-block">
          <select
            {...register(`customParams.${index}.name` as const, {
              required: 'Custom Parameter is required.',
            })}
            disabled={isDisabled}
            defaultValue={field.name}
          >
            <option value="">Select</option>
            {Object.keys(TOPIC_CUSTOM_PARAMS)
              .sort()
              .map((opt) => (
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
            <ErrorMessage errors={errors} name={`customParams.${index}.name`} />
          </p>
        </div>
      </div>

      <div className="column">
        <label className="label">Value</label>
        <input
          className="input"
          placeholder="Value"
          {...register(`customParams.${index}.value` as const, {
            required: 'Value is required.',
          })}
          defaultValue={field.value}
          autoComplete="off"
          disabled={isDisabled}
        />
        <p className="help is-danger">
          <ErrorMessage errors={errors} name={`customParams.${index}.value`} />
        </p>
      </div>

      <div className="column is-narrow">
        <label className="label">&nbsp;</label>
        <CustomParamButton
          className="is-danger"
          type="fa-minus"
          onClick={() => remove(index)}
        />
      </div>
    </div>
  );
};

export default React.memo(CustomParamField);
