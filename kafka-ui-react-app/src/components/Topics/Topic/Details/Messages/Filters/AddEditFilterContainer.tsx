import React from 'react';
import * as S from 'components/Topics/Topic/Details/Messages/Filters/Filters.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { Textarea } from 'components/common/Textbox/Textarea.styled';
import { FormProvider, Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'components/common/Button/Button';
import { FormError } from 'components/common/Input/Input.styled';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'lib/yupExtended';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  code: yup.string().required(),
});

export interface AddEditFilterContainerProps {
  title: string;
  cancelBtnHandler: () => void;
  submitBtnText: string;
  inputDisplayNameDefaultValue?: string;
  inputCodeDefaultValue?: string;
  toggleSaveFilterValue?: boolean;
  toggleSaveFilterSetter?: () => void;
  createNewFilterText?: string;
  submitCallback?: (values: MessageFilters) => void;
  submitCallbackWithReset?: boolean;
}

const AddEditFilterContainer: React.FC<AddEditFilterContainerProps> = ({
  title,
  cancelBtnHandler,
  submitBtnText,
  inputDisplayNameDefaultValue = '',
  inputCodeDefaultValue = '',
  toggleSaveFilterValue,
  toggleSaveFilterSetter,
  createNewFilterText,
  submitCallback,
  submitCallbackWithReset,
}) => {
  const methods = useForm<MessageFilters>({
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
    (values: MessageFilters) => {
      submitCallback?.(values);
      if (submitCallbackWithReset) {
        reset({ name: '', code: '' });
      }
    },
    [reset, submitCallback, submitCallbackWithReset]
  );

  return (
    <>
      <S.FilterTitle>{title}</S.FilterTitle>
      <FormProvider {...methods}>
        {createNewFilterText && (
          <S.CreatedFilter>{createNewFilterText}</S.CreatedFilter>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          aria-label="Filters submit Form"
        >
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
          <div>
            <InputLabel>Filter code</InputLabel>
            <Controller
              control={control}
              name="code"
              defaultValue={inputCodeDefaultValue}
              render={({ field: { onChange, ref } }) => (
                <Textarea ref={ref} onChange={onChange} />
              )}
            />
          </div>
          <div>
            <FormError>
              <ErrorMessage errors={errors} name="code" />
            </FormError>
          </div>
          {!!toggleSaveFilterSetter && (
            <S.CheckboxWrapper>
              <input
                type="checkbox"
                checked={toggleSaveFilterValue}
                onChange={toggleSaveFilterSetter}
              />
              <InputLabel>Save this filter</InputLabel>
            </S.CheckboxWrapper>
          )}
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
    </>
  );
};

export default AddEditFilterContainer;
