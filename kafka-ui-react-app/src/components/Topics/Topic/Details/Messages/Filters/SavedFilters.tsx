import React, { FC } from 'react';
import { Button } from 'components/common/Button/Button';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import useModal from 'lib/hooks/useModal';

import * as S from './Filters.styled';
import { MessageFilters } from './Filters';

export interface Props {
  filters: MessageFilters[];
  onEdit(index: number, filter: MessageFilters): void;
  deleteFilter(index: number): void;
  activeFilterHandler(activeFilter: MessageFilters, index: number): void;
  closeModal(): void;
  onGoBack(): void;
}

const SavedFilters: FC<Props> = ({
  filters,
  onEdit,
  deleteFilter,
  activeFilterHandler,
  closeModal,
  onGoBack,
}) => {
  const { isOpen, setOpen, setClose } = useModal();
  const [deleteIndex, setDeleteIndex] = React.useState<number>(-1);
  const [selectedFilter, setSelectedFilter] = React.useState(-1);

  const activeFilter = () => {
    if (selectedFilter > -1) {
      activeFilterHandler(filters[selectedFilter], selectedFilter);
    }
    closeModal();
  };

  const deleteFilterHandler = (index: number) => {
    setOpen();
    setDeleteIndex(index);
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isOpen}
        title="Confirm deletion"
        onConfirm={() => {
          deleteFilter(deleteIndex);
          setClose();
        }}
        onCancel={setClose}
        submitBtnText="Delete"
      >
        <S.ConfirmDeletionText>
          Are you sure want to remove {filters[deleteIndex]?.name}?
        </S.ConfirmDeletionText>
      </ConfirmationModal>
      <S.BackToCustomText onClick={onGoBack}>
        Back To custom filters
      </S.BackToCustomText>
      <S.SavedFiltersContainer>
        <S.CreatedFilter>Saved filters</S.CreatedFilter>
        {filters.length === 0 && <p>No saved filter(s)</p>}
        {filters.map((filter, index) => (
          <S.SavedFilter
            key={Symbol(filter.name).toString()}
            selected={selectedFilter === index}
            onClick={() => setSelectedFilter(index)}
          >
            <S.SavedFilterName>{filter.name}</S.SavedFilterName>
            <S.FilterOptions>
              <S.FilterEdit onClick={() => onEdit(index, filter)}>
                Edit
              </S.FilterEdit>
              <S.DeleteSavedFilter
                data-testid="deleteIcon"
                onClick={() => deleteFilterHandler(index)}
              >
                <i className="fas fa-times" />
              </S.DeleteSavedFilter>
            </S.FilterOptions>
          </S.SavedFilter>
        ))}
      </S.SavedFiltersContainer>
      <S.FilterButtonWrapper>
        <Button
          buttonSize="M"
          buttonType="secondary"
          type="button"
          onClick={closeModal}
          disabled={isOpen}
        >
          Cancel
        </Button>
        <Button
          buttonSize="M"
          buttonType="primary"
          type="button"
          onClick={activeFilter}
          disabled={isOpen}
        >
          Select filter
        </Button>
      </S.FilterButtonWrapper>
    </>
  );
};

export default SavedFilters;
