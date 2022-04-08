import React from 'react';
import * as S from 'components/Topics/Topic/Details/Messages/Filters/Filters.styled';
import { Button } from 'components/common/Button/Button';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { FilterEdit } from 'components/Topics/Topic/Details/Messages/Filters/FilterModal';
import useModal from 'lib/hooks/useModal';

import AddEditFilterContainer from './AddEditFilterContainer';
import DeleteFilterModal from './DeleteFilterModal';

export interface FilterModalProps {
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
  const { isOpen, setOpen, setClose } = useModal();
  const [deleteIndex, setDeleteIndex] = React.useState<number>(-1);

  const deleteFilterHandler = (index: number) => {
    setOpen();
    setDeleteIndex(index);
  };
  const activeFilter = () => {
    if (selectedFilter > -1) {
      activeFilterHandler(filters[selectedFilter], selectedFilter);
      toggleIsOpen();
    }
  };

  const onSubmit = React.useCallback(
    async (values: MessageFilters) => {
      if (!toggleSaveFilter) {
        activeFilterHandler(values, -1);
      } else {
        addFilter(values);
      }
      setAddNewFilter(!addNewFilter);
    },
    [addNewFilter, toggleSaveFilter, activeFilterHandler, addFilter]
  );
  return !addNewFilter ? (
    <>
      <S.FilterTitle>Add filter</S.FilterTitle>
      <S.NewFilterIcon onClick={() => setAddNewFilter(!addNewFilter)}>
        <i className="fas fa-plus fa-sm" /> New filter
      </S.NewFilterIcon>
      <S.CreatedFilter>Created filters</S.CreatedFilter>
      <DeleteFilterModal
        isOpen={isOpen}
        name={filters[deleteIndex]?.name}
        onDelete={() => {
          deleteFilter(deleteIndex);
          setClose();
        }}
        onClose={setClose}
      />
      <S.SavedFiltersContainer>
        {filters.length === 0 && <p>no saved filter(s)</p>}
        {filters.map((filter, index) => (
          <S.SavedFilter
            key={Symbol(filter.name).toString()}
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
          onClick={toggleIsOpen}
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
  ) : (
    <AddEditFilterContainer
      title="Add filter"
      cancelBtnHandler={() => setAddNewFilter(!addNewFilter)}
      submitBtnText="Add filter"
      submitCallback={onSubmit}
      submitCallbackWithReset
      createNewFilterText="Create a new filter"
      toggleSaveFilterValue={toggleSaveFilter}
      toggleSaveFilterSetter={() => setToggleSaveFilter(!toggleSaveFilter)}
    />
  );
};

export default AddFilter;
