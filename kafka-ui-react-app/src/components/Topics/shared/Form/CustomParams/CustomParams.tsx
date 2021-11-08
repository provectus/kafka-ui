import React from 'react';
import { TopicConfigByName, TopicFormData } from 'redux/interfaces';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from 'components/common/Button/Button';
import styled from 'styled-components';

import CustomParamField from './CustomParamField';

export const INDEX_PREFIX = 'customParams';

interface Props {
  isSubmitting: boolean;
  config?: TopicConfigByName;
}

const CustomParamsWrapper = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
`;

const CustomParams: React.FC<Props> = ({ isSubmitting }) => {
  const { control } = useFormContext<TopicFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: INDEX_PREFIX,
  });
  const [existingFields, setExistingFields] = React.useState<string[]>([]);
  const removeField = (index: number): void => {
    setExistingFields(
      existingFields.filter((field) => field === fields[index].name)
    );
    remove(index);
  };

  return (
    <CustomParamsWrapper>
      {fields.map((field, idx) => (
        <CustomParamField
          key={field.id}
          field={field}
          remove={removeField}
          index={idx}
          isDisabled={isSubmitting}
          existingFields={existingFields}
          setExistingFields={setExistingFields}
        />
      ))}
      <div>
        <Button
          type="button"
          buttonSize="M"
          buttonType="secondary"
          onClick={() => append({ name: '', value: '' })}
        >
          <i className="fas fa-plus" />
          Add Custom Parameter
        </Button>
      </div>
    </CustomParamsWrapper>
  );
};

export default CustomParams;
