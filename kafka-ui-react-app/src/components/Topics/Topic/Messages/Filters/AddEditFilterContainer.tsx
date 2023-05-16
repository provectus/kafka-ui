import React from 'react';
import * as S from 'components/Topics/Topic/Messages/Filters/Filters.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { FormProvider, Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'components/common/Button/Button';
import { FormError } from 'components/common/Input/Input.styled';
import { AddMessageFilters } from 'components/Topics/Topic/Messages/Filters/AddFilter';
import Editor from 'components/common/Editor/Editor';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'lib/yupExtended';

const validationSchema = yup.object().shape({
  saveFilter: yup.boolean(),
  code: yup.string().required(),
  name: yup.string().when('saveFilter', {
    is: (value: boolean | undefined) => typeof value === 'undefined' || value,
    then: (schema) => schema.required(),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export interface AddEditFilterContainerProps {
  cancelBtnHandler: () => void;
  submitBtnText: string;
  inputDisplayNameDefaultValue?: string;
  inputCodeDefaultValue?: string;
  isAdd?: boolean;
  submitCallback?: (values: AddMessageFilters) => void;
}

const AddEditFilterContainer: React.FC<AddEditFilterContainerProps> = ({
  cancelBtnHandler,
  submitBtnText,
  inputDisplayNameDefaultValue = '',
  inputCodeDefaultValue = '',
  submitCallback,
  isAdd,
}) => {
  const methods = useForm<AddMessageFilters>({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });
  const {
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, isValid, errors },
    reset,
  } = methods;

  const onSubmit = React.useCallback(
    (values: AddMessageFilters) => {
      try {
        submitCallback?.(values);
        reset({ name: '', code: '', saveFilter: false });
      } catch (e) {
        // do nothing
      }
    },
    [isAdd, reset, submitCallback]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} aria-label="Filters submit Form">
        <div>
          <InputLabel>Filter code</InputLabel>
          <Controller
            control={control}
            name="code"
            defaultValue={inputCodeDefaultValue}
            render={({ field: { onChange, value } }) => (
              <Editor
                value={value}
                minLines={5}
                maxLines={28}
                onChange={onChange}
                setOptions={{
                  showLineNumbers: false,
                }}
              />
            )}
          />
        </div>
        <div>
          <FormError>
            <ErrorMessage errors={errors} name="code" />
          </FormError>
        </div>
        {isAdd && (
          <InputLabel>
            <input {...methods.register('saveFilter')} type="checkbox" />
            Save this filter
          </InputLabel>
        )}
        <div>
          <InputLabel>Display name</InputLabel>
          <Input
            inputSize="M"
            placeholder="Enter Name"
            autoComplete="off"
            name="name"
            defaultValue={inputDisplayNameDefaultValue}
          />
        </div>
        <div>
          <FormError>
            <ErrorMessage errors={errors} name="name" />
          </FormError>
        </div>
        <S.FilterButtonWrapper>
          <Button
            buttonSize="M"
            buttonType="secondary"
            type="button"
            onClick={cancelBtnHandler}
          >
            Cancel
          </Button>
          <Button
            buttonSize="M"
            buttonType="primary"
            type="submit"
            disabled={!isValid || isSubmitting || !isDirty}
          >
            {submitBtnText}
          </Button>
        </S.FilterButtonWrapper>
      </form>
    </FormProvider>
  );
};

export default AddEditFilterContainer;
