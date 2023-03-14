import React, { FC } from 'react';
import { Button } from 'components/common/Button/Button';
import DeleteIcon from 'components/common/Icons/DeleteIcon';
import { useConfirm } from 'lib/hooks/useConfirm';

import * as S from './Filters.styled';
import { MessageFilters } from './Filters';

export interface Props {
  filters: MessageFilters[];
  onEdit(index: number, filter: MessageFilters): void;
  deleteFilter(index: number): void;
  activeFilterHandler(activeFilter: MessageFilters, index: number): void;
  closeModal(): void;
  onGoBack(): void;
  activeFilter?: MessageFilters;
}

const SavedFilters: FC<Props> = ({
  filters,
  onEdit,
  deleteFilter,
  activeFilterHandler,
  closeModal,
  onGoBack,
  activeFilter,
}) => {
  const [selectedFilter, setSelectedFilter] = React.useState(-1);
  const confirm = useConfirm();

  const activateFilter = () => {
    if (selectedFilter > -1) {
      activeFilterHandler(filters[selectedFilter], selectedFilter);
    }
    closeModal();
  };

  const deleteFilterHandler = (index: number) => {
    const filterName = filters[index]?.name;
    const isFilterSelected = activeFilter && activeFilter.name === filterName;

    confirm(
      <>
        <p>Are you sure want to remove {filterName}?</p>
        {isFilterSelected && (
          <>
            <br />
            <p>Warning: this filter is currently selected.</p>
          </>
        )}
      </>,
      () => {
        deleteFilter(index);
        setSelectedFilter(-1);
      }
    );
  };

  return (
    <>
      <S.BackToCustomText onClick={onGoBack}>
        Back To create filters
      </S.BackToCustomText>
      <S.SavedFiltersContainer>
        <S.CreatedFilter>Saved filters</S.CreatedFilter>
        {filters.length === 0 && (
          <S.NoSavedFilter>No saved filter(s)</S.NoSavedFilter>
        )}
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
              <S.DeleteSavedFilter onClick={() => deleteFilterHandler(index)}>
                <DeleteIcon />
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
        >
          Cancel
        </Button>
        <Button
          buttonSize="M"
          buttonType="primary"
          type="button"
          onClick={activateFilter}
          disabled={selectedFilter === -1}
        >
          Select filter
        </Button>
      </S.FilterButtonWrapper>
    </>
  );
};

export default SavedFilters;
