import React from 'react';
import { useFormContext, ErrorMessage } from 'react-hook-form';
import { TopicFormCustomParam } from 'redux/interfaces';
import CustomParamOptions from './CustomParamOptions';
import { INDEX_PREFIX } from './CustomParams';

interface Props {
  isDisabled: boolean;
  index: string;
  name: string;
}

const CustomParamSelect: React.FC<Props> = ({ isDisabled, index, name }) => {
  const { register, errors, getValues, triggerValidation } = useFormContext();
  const optInputName = `${index}[name]`;

  const selectedMustBeUniq = (selected: string) => {
    const values = getValues({ nest: true });
    const customParamsValues: TopicFormCustomParam = values.customParams;

    let valid = true;

    for (const [key, customParam] of Object.entries(customParamsValues)) {
      if (`${INDEX_PREFIX}.${key}` !== index) {
        if (selected === customParam.name) {
          valid = false;
          break;
        }
      }
    }

    return valid ? true : 'Custom Parameter must be unique';
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
          onChange={() => triggerValidation(optInputName)}
          disabled={isDisabled}
          defaultValue={name}
        >
          <CustomParamOptions />
        </select>
        <p className="help is-danger">
          <ErrorMessage errors={errors} name={optInputName} />
        </p>
      </div>
    </>
  );
};

export default React.memo(CustomParamSelect);
