import React from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';
import { FieldArrayWithId, useFormContext } from 'react-hook-form';
import { remove as _remove } from 'lodash';
import { TopicFormData } from 'redux/interfaces';
import { TopicFormColumn } from 'components/Topics/shared/Form/TopicForm';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { FormError } from 'components/common/Input/Input.styled';
import Select from 'components/common/Select/Select';
import Input from 'components/common/Input/Input';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseIcon from 'components/common/Icons/CloseIcon';
import styled from 'styled-components';

interface Props {
  isDisabled: boolean;
  index: number;
  existingFields: string[];
  field: FieldArrayWithId<TopicFormData, 'customParams', 'id'>;
  remove: (index: number) => void;
  setExistingFields: React.Dispatch<React.SetStateAction<string[]>>;
}

const CustomParamDeleteButtonWrapper = styled.div`
  height: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: flex-end;
  flex-grow: 0.25 !important;
`;

const CustomParamField: React.FC<Props> = ({
  field,
  isDisabled,
  index,
  remove,
  existingFields,
  setExistingFields,
}) => {
  const {
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
    <TopicFormColumn>
      <>
        <div>
          <InputLabel>Custom Parameter</InputLabel>
          <Select
            selectSize="M"
            name={`customParams.${index}.name` as const}
            hookFormOptions={{
              required: 'Custom Parameter is required.',
            }}
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
          </Select>
          <FormError>
            <ErrorMessage errors={errors} name={`customParams.${index}.name`} />
          </FormError>
        </div>
      </>

      <div>
        <InputLabel>Value</InputLabel>
        <Input
          inputSize="M"
          name={`customParams.${index}.value` as const}
          hookFormOptions={{
            required: 'Value is required.',
          }}
          placeholder="Value"
          defaultValue={field.value}
          autoComplete="off"
          disabled={isDisabled}
        />
        <FormError>
          <ErrorMessage errors={errors} name={`customParams.${index}.value`} />
        </FormError>
      </div>

      <CustomParamDeleteButtonWrapper>
        <IconButtonWrapper onClick={() => remove(index)} aria-hidden>
          <CloseIcon />
        </IconButtonWrapper>
      </CustomParamDeleteButtonWrapper>
    </TopicFormColumn>
  );
};

export default React.memo(CustomParamField);
