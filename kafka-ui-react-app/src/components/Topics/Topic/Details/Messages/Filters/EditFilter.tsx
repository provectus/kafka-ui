import * as React from 'react';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { Textarea } from 'components/common/Textbox/Textarea.styled';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'components/common/Button/Button';
import yup from 'lib/yupExtended';
import { yupResolver } from '@hookform/resolvers/yup';
import * as S from 'components/Topics/Topic/Details/Messages/Filters/Filters.styled';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { FilterEdit } from 'components/Topics/Topic/Details/Messages/Filters/FilterModal';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  code: yup.string().required(),
});

interface EditFilterProps {
  editFilter: FilterEdit;
  toggleEditModal(): void;
  editSavedFilter(filter: FilterEdit): void;
}

const EditFilter: React.FC<EditFilterProps> = ({
  editFilter,
  toggleEditModal,
  editSavedFilter,
}) => {
  const methods = useForm<MessageFilters>({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });
  const {
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, isValid, errors },
  } = methods;
  const onSubmit = React.useCallback(
    async (values: MessageFilters) => {
      editSavedFilter({ index: editFilter.index, filter: values });
      toggleEditModal();
    },
    [editSavedFilter]
  );
  return (
    <>
      <S.FilterTitle>Edit saved filter</S.FilterTitle>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} aria-label="Add new Filter">
          <div>
            <InputLabel>Display name</InputLabel>
            <Input
              inputSize="M"
              placeholder="Enter Name"
              autoComplete="off"
              name="name"
              defaultValue={editFilter.filter.name}
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
              defaultValue={editFilter.filter.code}
              render={({ field: { onChange, ref } }) => (
                <Textarea ref={ref} onChange={onChange} />
              )}
            />
          </div>
          <div>
            <ErrorMessage errors={errors} name="code" />
          </div>
          <S.FilterButtonWrapper>
            <Button
              buttonSize="M"
              buttonType="secondary"
              type="button"
              onClick={() => toggleEditModal()}
            >
              Cancel
            </Button>
            <Button
              buttonSize="M"
              buttonType="primary"
              type="submit"
              disabled={!isValid || isSubmitting || !isDirty}
            >
              Save
            </Button>
          </S.FilterButtonWrapper>
        </form>
      </FormProvider>
    </>
  );
};

export default EditFilter;
