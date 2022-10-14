import React from 'react';
import * as S from 'components/Topics/Topic/Messages/Filters/Filters.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { FormProvider, Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'components/common/Button/Button';
import { FormError } from 'components/common/Input/Input.styled';
import Editor from 'components/common/Editor/Editor';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'lib/yupExtended';
import { AdvancedFilter } from 'lib/hooks/useMessageFiltersStore';

const validationSchema = yup.object().shape({
  value: yup.string().required(),
  name: yup.string().required(),
});

export interface FormProps {
  name?: string;
  value?: string;
  save(filter: AdvancedFilter): void;
  apply(filter: AdvancedFilter): void;
}

const Form: React.FC<FormProps> = ({ name, value, save, apply }) => {
  const methods = useForm<AdvancedFilter>({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });
  const {
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, isValid, errors },
    reset,
    getValues,
  } = methods;

  const onSubmit = React.useCallback(
    (values: AdvancedFilter) => {
      apply(values);
      reset({ name: '', value: '' });
    },
    [reset, save]
  );

  const onSave = React.useCallback(() => {
    save(getValues());
    handleSubmit(onSubmit);
  }, []);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} aria-label="Filters submit Form">
        <div>
          <InputLabel>Filter code</InputLabel>
          <Controller
            control={control}
            name="value"
            defaultValue={value}
            render={({ field }) => (
              <Editor
                value={field.value}
                minLines={5}
                maxLines={28}
                onChange={field.onChange}
                setOptions={{
                  showLineNumbers: false,
                }}
              />
            )}
          />
        </div>
        <div>
          <FormError>
            <ErrorMessage errors={errors} name="value" />
          </FormError>
        </div>
        <div>
          <InputLabel>Display name</InputLabel>
          <Input
            inputSize="M"
            placeholder="Enter Name"
            autoComplete="off"
            name="name"
            defaultValue={name}
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
            type="submit"
            disabled={!isValid || isSubmitting || !isDirty}
            onClick={onSave}
          >
            Save & Apply
          </Button>
          <Button
            buttonSize="M"
            buttonType="primary"
            type="submit"
            disabled={isSubmitting || !isDirty}
          >
            Apply Filter
          </Button>
        </S.FilterButtonWrapper>
      </form>
    </FormProvider>
  );
};

export default Form;
