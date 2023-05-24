import React from 'react';
import * as S from 'components/Topics/Topic/Messages/Filters/Filters.styled';
import {
  ActiveMessageFilter,
  MessageFilters,
} from 'components/Topics/Topic/Messages/Filters/Filters';
import AddFilter from 'components/Topics/Topic/Messages/Filters/AddFilter';
import EditFilter from 'components/Topics/Topic/Messages/Filters/EditFilter';

export interface FilterModalProps {
  toggleIsOpen(): void;
  filters: MessageFilters[];
  addFilter(values: MessageFilters): void;
  deleteFilter(index: number): void;
  activeFilterHandler(activeFilter: MessageFilters, index: number): void;
  editSavedFilter(filter: FilterEdit): void;
  activeFilter: ActiveMessageFilter;
  quickEditMode?: boolean;
}

export interface FilterEdit {
  index: number;
  filter: MessageFilters;
}

const FilterModal: React.FC<FilterModalProps> = ({
  toggleIsOpen,
  filters,
  addFilter,
  deleteFilter,
  activeFilterHandler,
  editSavedFilter,
  activeFilter,
  quickEditMode = false,
}) => {
  const [isInEditMode, setIsInEditMode] =
    React.useState<boolean>(quickEditMode);
  const [isSavedFiltersOpen, setIsSavedFiltersOpen] =
    React.useState<boolean>(false);

  const toggleEditModal = () => {
    setIsInEditMode(!isInEditMode);
  };

  const [editFilter, setEditFilter] = React.useState<FilterEdit>(() => {
    const { index, name, code } = activeFilter;
    return quickEditMode
      ? { index, filter: { name, code } }
      : { index: -1, filter: { name: '', code: '' } };
  });
  const editFilterHandler = (value: FilterEdit) => {
    setEditFilter(value);
    setIsInEditMode(!isInEditMode);
  };

  const toggleEditModalHandler = quickEditMode ? toggleIsOpen : toggleEditModal;

  return (
    <S.MessageFilterModal data-testid="messageFilterModal">
      {isInEditMode ? (
        <EditFilter
          editFilter={editFilter}
          toggleEditModal={toggleEditModalHandler}
          editSavedFilter={editSavedFilter}
        />
      ) : (
        <AddFilter
          toggleIsOpen={toggleIsOpen}
          filters={filters}
          addFilter={addFilter}
          deleteFilter={deleteFilter}
          activeFilterHandler={activeFilterHandler}
          toggleEditModal={toggleEditModal}
          editFilter={editFilterHandler}
          isSavedFiltersOpen={isSavedFiltersOpen}
          onClickSavedFilters={() => setIsSavedFiltersOpen(!isSavedFiltersOpen)}
          activeFilter={activeFilter}
        />
      )}
    </S.MessageFilterModal>
  );
};

export default FilterModal;
