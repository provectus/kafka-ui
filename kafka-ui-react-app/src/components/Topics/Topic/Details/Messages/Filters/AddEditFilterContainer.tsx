import React from 'react';
import * as S from 'components/Topics/Topic/Details/Messages/Filters/Filters.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { Textarea } from 'components/common/Textbox/Textarea.styled';
import {
  FormProvider,
  Controller,
  DeepMap,
  FieldError,
  Control,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'components/common/Button/Button';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';

export interface AddEditFilterContainerProps {
  title: string;
  methods: UseFormReturn<MessageFilters>;
  onSubmit: () => void;
  cancelBtnHandler: () => void;
  submitBtnDisabled: boolean;
  submitBtnText: string;
  handleSubmit: () => void;
  errors: DeepMap<MessageFilters, FieldError> | undefined;
  control: Control<FieldValues> | undefined;
  toggleSaveFilter?: boolean;
  inputDisplayNameDefaultValue?: string;
  setToggleSaveFilter?: () => void;
  inputCodeDefaultValue?: string;
  createNewFilterText?: string;
}

const AddEditFilterContainer: React.FC<AddEditFilterContainerProps> = ({
  title,
  methods,
  toggleSaveFilter,
  setToggleSaveFilter,
  cancelBtnHandler,
  submitBtnDisabled,
  submitBtnText,
  handleSubmit,
  errors,
  control,
  createNewFilterText,
  inputDisplayNameDefaultValue = '',
  inputCodeDefaultValue = '',
}) => {
  return (
    <>
      <S.FilterTitle>{title}</S.FilterTitle>
      <FormProvider {...methods}>
        {createNewFilterText && (
          <S.CreatedFilter>{createNewFilterText}</S.CreatedFilter>
        )}
        <form onSubmit={handleSubmit} aria-label="Filters submit Form">
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
            <ErrorMessage errors={errors} name="name" />
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
            <ErrorMessage errors={errors} name="code" />
          </div>
          {toggleSaveFilter && setToggleSaveFilter && (
            <S.CheckboxWrapper>
              <input
                type="checkbox"
                checked={toggleSaveFilter}
                onChange={setToggleSaveFilter}
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
              disabled={submitBtnDisabled}
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
