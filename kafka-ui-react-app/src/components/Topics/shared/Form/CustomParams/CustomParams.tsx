import React from 'react';
import { TopicConfigByName, TopicFormData } from 'redux/interfaces';
import { useFieldArray, useFormContext } from 'react-hook-form';

import CustomParamButton from './CustomParamButton';
import CustomParamField from './CustomParamField';

export const INDEX_PREFIX = 'customParams';

interface Props {
  isSubmitting: boolean;
  config?: TopicConfigByName;
}

const CustomParams: React.FC<Props> = ({ isSubmitting }) => {
  const { control } = useFormContext<TopicFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: INDEX_PREFIX,
  });
  const [existingFields, setExistingFields] = React.useState<string[]>([]);

  return (
    <>
      <div className="columns">
        <div className="column">
          <CustomParamButton
            className="is-success"
            type="fa-plus"
            onClick={() => append({ name: '', value: '' })}
            btnText="Add Custom Parameter"
          />
        </div>
      </div>
      {fields.map((field, idx) => (
        <CustomParamField
          key={field.id}
          field={field}
          remove={remove}
          index={idx}
          isDisabled={isSubmitting}
          existingFields={existingFields}
          setExistingFields={setExistingFields}
        />
      ))}
    </>
  );
};

export default CustomParams;
