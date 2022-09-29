import React from 'react';
import * as S from 'components/Topics/Topic/Messages/Filters/Filters.styled';
import { MessageFilters } from 'components/Topics/Topic/Messages/Filters/Filters';
import AddFilter from 'components/Topics/Topic/Messages/Filters/AddFilter';
import EditFilter from 'components/Topics/Topic/Messages/Filters/EditFilter';

export interface FilterModalProps {
  toggleIsOpen(): void;
  filters: MessageFilters[];
  addFilter(values: MessageFilters): void;
  deleteFilter(index: number): void;
  activeFilterHandler(activeFilter: MessageFilters, index: number): void;
  editSavedFilter(filter: FilterEdit): void;
  activeFilter?: MessageFilters;
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
}) => {
  const [addFilterModal, setAddFilterModal] = React.useState<boolean>(true);
  const [isSavedFiltersOpen, setIsSavedFiltersOpen] =
    React.useState<boolean>(false);

  const toggleEditModal = () => {
    setAddFilterModal(!addFilterModal);
  };

  const [editFilter, setEditFilter] = React.useState<FilterEdit>({
    index: -1,
    filter: { name: '', code: '' },
  });
  const editFilterHandler = (value: FilterEdit) => {
    setEditFilter(value);
    setAddFilterModal(!addFilterModal);
  };

  return (
    <S.MessageFilterModal data-testid="messageFilterModal">
      {addFilterModal ? (
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
      ) : (
        <EditFilter
          editFilter={editFilter}
          toggleEditModal={toggleEditModal}
          editSavedFilter={editSavedFilter}
        />
      )}
    </S.MessageFilterModal>
  );
};

export default FilterModal;
