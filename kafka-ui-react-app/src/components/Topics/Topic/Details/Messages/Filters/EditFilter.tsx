import React from 'react';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { FilterEdit } from 'components/Topics/Topic/Details/Messages/Filters/FilterModal';

import AddEditFilterContainer from './AddEditFilterContainer';

export interface EditFilterProps {
  editFilter: FilterEdit;
  toggleEditModal(): void;
  editSavedFilter(filter: FilterEdit): void;
}

const EditFilter: React.FC<EditFilterProps> = ({
  editFilter,
  toggleEditModal,
  editSavedFilter,
}) => {
  const onSubmit = React.useCallback(
    (values: MessageFilters) => {
      editSavedFilter({ index: editFilter.index, filter: values });
      toggleEditModal();
    },
    [editSavedFilter, editFilter.index, toggleEditModal]
  );
  return (
    <AddEditFilterContainer
      title="Edit saved filter"
      cancelBtnHandler={() => toggleEditModal()}
      submitBtnText="Save"
      inputDisplayNameDefaultValue={editFilter.filter.name}
      inputCodeDefaultValue={editFilter.filter.code}
      submitCallback={onSubmit}
    />
  );
};

export default EditFilter;
