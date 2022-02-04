import React, { useRef } from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { TOPIC_CUSTOM_PARAMS } from 'lib/constants';
import { FieldArrayWithId, useFormContext, Controller } from 'react-hook-form';
import { TopicFormData } from 'redux/interfaces';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { FormError } from 'components/common/Input/Input.styled';
import Select from 'components/common/Select/Select';
import Input from 'components/common/Input/Input';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseIcon from 'components/common/Icons/CloseIcon';
import * as C from 'components/Topics/shared/Form/TopicForm.styled';

import * as S from './CustomParams.styled';

export interface Props {
  isDisabled: boolean;
  index: number;
  existingFields: string[];
  field: FieldArrayWithId<TopicFormData, 'customParams', 'id'>;
  remove: (index: number) => void;
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
    formState: { errors },
    setValue,
    watch,
    control,
  } = useFormContext<TopicFormData>();
  const nameValue = watch(`customParams.${index}.name`);
  const prevName = useRef(nameValue);

  React.useEffect(() => {
    if (nameValue !== prevName.current) {
      let newExistingFields = [...existingFields];
      if (prevName.current) {
        newExistingFields = newExistingFields.filter(
          (name) => name !== prevName.current
        );
      }
      prevName.current = nameValue;
      newExistingFields.push(nameValue);
      setExistingFields(newExistingFields);
      setValue(`customParams.${index}.value`, TOPIC_CUSTOM_PARAMS[nameValue], {
        shouldValidate: true,
      });
    }
  }, [nameValue]);

  return (
    <C.Column>
      <div>
        <InputLabel>Custom Parameter</InputLabel>
        <Controller
          control={control}
          rules={{ required: 'Custom Parameter is required.' }}
          name={`customParams.${index}.name`}
          render={({ field: { value, name, onChange } }) => (
            <Select
              name={name}
              placeholder="Select"
              disabled={isDisabled}
              minWidth="270px"
              onChange={onChange}
              value={value}
              options={Object.keys(TOPIC_CUSTOM_PARAMS)
                .sort()
                .map((opt) => ({
                  value: opt,
                  label: opt,
                  disabled: existingFields.includes(opt),
                }))}
            />
          )}
        />
        <FormError>
          <ErrorMessage
            errors={errors}
            name={`customParams.${index}.name` as const}
          />
        </FormError>
      </div>
      <div>
        <InputLabel>Value</InputLabel>
        <Input
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
          <ErrorMessage
            errors={errors}
            name={`customParams.${index}.value` as const}
          />
        </FormError>
      </div>

      <S.DeleteButtonWrapper>
        <IconButtonWrapper
          onClick={() => remove(index)}
          onKeyDown={(e: React.KeyboardEvent) =>
            e.code === 'Space' && remove(index)
          }
          title={`Delete customParam field ${index}`}
        >
          <CloseIcon aria-hidden />
        </IconButtonWrapper>
      </S.DeleteButtonWrapper>
    </C.Column>
  );
};

export default React.memo(CustomParamField);
