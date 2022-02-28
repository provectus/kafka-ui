import * as React from 'react';
import * as S from 'components/Topics/Topic/Details/Messages/Filters/Filters.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { Textarea } from 'components/common/Textbox/Textarea.styled';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'components/common/Button/Button';
import yup from 'lib/yupExtended';
import { yupResolver } from '@hookform/resolvers/yup';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { FilterEdit } from 'components/Topics/Topic/Details/Messages/Filters/FilterModal';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  code: yup.string().required(),
});

interface FilterModalProps {
  toggleIsOpen(): void;
  filters: MessageFilters[];
  addFilter(values: MessageFilters): void;
  deleteFilter(index: number): void;
  activeFilterHandler(activeFilter: MessageFilters, index: number): void;
  toggleEditModal(): void;
  editFilter(value: FilterEdit): void;
}

const AddFilter: React.FC<FilterModalProps> = ({
  toggleIsOpen,
  filters,
  addFilter,
  deleteFilter,
  activeFilterHandler,
  toggleEditModal,
  editFilter,
}) => {
  const [addNewFilter, setAddNewFilter] = React.useState(false);
  const [toggleSaveFilter, setToggleSaveFilter] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState(-1);
  const [toggleDeletionModal, setToggleDeletionModal] =
    React.useState<boolean>(false);
  const [deleteIndex, setDeleteIndex] = React.useState<number>(-1);

  const deleteFilterHandler = (index: number) => {
    setToggleDeletionModal(!toggleDeletionModal);
    setDeleteIndex(index);
  };
  const activeFilter = () => {
    if (selectedFilter > -1) {
      activeFilterHandler(filters[selectedFilter], selectedFilter);
      toggleIsOpen();
    }
  };
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
    async (values: MessageFilters) => {
      if (!toggleSaveFilter) {
        activeFilterHandler(values, -1);
      } else {
        addFilter(values);
      }
      setAddNewFilter(!addNewFilter);
      reset({ name: '', code: '' });
    },
    [addNewFilter, toggleSaveFilter]
  );
  return !addNewFilter ? (
    <>
      <S.FilterTitle>Add filter</S.FilterTitle>
      <S.NewFilterIcon onClick={() => setAddNewFilter(!addNewFilter)}>
        <i className="fas fa-plus fa-sm" /> New filter
      </S.NewFilterIcon>
      <S.CreatedFilter>Created filters</S.CreatedFilter>
      {toggleDeletionModal && (
        <S.ConfirmDeletionModal>
          <S.ConfirmDeletionModalHeader>
            <S.ConfirmDeletionTitle>Confirm deletion</S.ConfirmDeletionTitle>
            <S.CloseDeletionModalIcon
              onClick={() => setToggleDeletionModal(!toggleDeletionModal)}
            >
              <i className="fas fa-times-circle" />
            </S.CloseDeletionModalIcon>
          </S.ConfirmDeletionModalHeader>
          <S.ConfirmDeletionText>
            Are you sure want to remove {filters[deleteIndex].name}?
          </S.ConfirmDeletionText>
          <S.FilterButtonWrapper>
            <Button
              buttonSize="M"
              buttonType="secondary"
              type="button"
              onClick={() => setToggleDeletionModal(!toggleDeletionModal)}
            >
              Cancel
            </Button>
            <Button
              buttonSize="M"
              buttonType="primary"
              type="button"
              onClick={() => {
                deleteFilter(deleteIndex);
                setToggleDeletionModal(!toggleDeletionModal);
              }}
            >
              Delete
            </Button>
          </S.FilterButtonWrapper>
        </S.ConfirmDeletionModal>
      )}
      <S.SavedFiltersContainer>
        {filters.length === 0 ? (
          <p>no saved filter(s)</p>
        ) : (
          filters.map((filter, index) => (
            <S.SavedFilter
              key={Math.random()}
              selected={selectedFilter === index}
              onClick={() => setSelectedFilter(index)}
            >
              <S.SavedFilterName>{filter.name}</S.SavedFilterName>
              <S.FilterOptions>
                <S.FilterEdit
                  onClick={() => {
                    toggleEditModal();
                    editFilter({ index, filter });
                  }}
                >
                  Edit
                </S.FilterEdit>
                <S.DeleteSavedFilter onClick={() => deleteFilterHandler(index)}>
                  <i className="fas fa-times" />
                </S.DeleteSavedFilter>
              </S.FilterOptions>
            </S.SavedFilter>
          ))
        )}
      </S.SavedFiltersContainer>
      <S.FilterButtonWrapper>
        <Button
          buttonSize="M"
          buttonType="secondary"
          type="button"
          onClick={toggleIsOpen}
          disabled={toggleDeletionModal}
        >
          Cancel
        </Button>
        <Button
          buttonSize="M"
          buttonType="primary"
          type="button"
          onClick={activeFilter}
          disabled={toggleDeletionModal}
        >
          Select filter
        </Button>
      </S.FilterButtonWrapper>
    </>
  ) : (
    <>
      <S.FilterTitle>Add filter</S.FilterTitle>
      <FormProvider {...methods}>
        <S.CreatedFilter>Create a new filter</S.CreatedFilter>
        <form onSubmit={handleSubmit(onSubmit)} aria-label="Add new Filter">
          <div>
            <InputLabel>Display name</InputLabel>
            <Input
              inputSize="M"
              placeholder="Enter Name"
              autoComplete="off"
              name="name"
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
              render={({ field: { onChange, ref } }) => (
                <Textarea ref={ref} onChange={onChange} />
              )}
            />
          </div>
          <div>
            <ErrorMessage errors={errors} name="code" />
          </div>
          <S.CheckboxWrapper>
            <input
              type="checkbox"
              checked={toggleSaveFilter}
              onChange={() => {
                setToggleSaveFilter(!toggleSaveFilter);
              }}
            />
            <InputLabel>Save this filter</InputLabel>
          </S.CheckboxWrapper>
          <S.FilterButtonWrapper>
            <Button
              buttonSize="M"
              buttonType="secondary"
              type="button"
              onClick={() => setAddNewFilter(!addNewFilter)}
            >
              Cancel
            </Button>
            <Button
              buttonSize="M"
              buttonType="primary"
              type="submit"
              disabled={!isValid || isSubmitting || !isDirty}
            >
              Add filter
            </Button>
          </S.FilterButtonWrapper>
        </form>
      </FormProvider>
    </>
  );
};

export default AddFilter;
