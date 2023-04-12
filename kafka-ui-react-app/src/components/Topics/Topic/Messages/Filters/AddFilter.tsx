import React from 'react';
import * as S from 'components/Topics/Topic/Messages/Filters/Filters.styled';
import { MessageFilters } from 'components/Topics/Topic/Messages/Filters/Filters';
import { FilterEdit } from 'components/Topics/Topic/Messages/Filters/FilterModal';
import SavedFilters from 'components/Topics/Topic/Messages/Filters/SavedFilters';
import SavedIcon from 'components/common/Icons/SavedIcon';
import QuestionIcon from 'components/common/Icons/QuestionIcon';
import useBoolean from 'lib/hooks/useBoolean';
import { showAlert } from 'lib/errorHandling';

import AddEditFilterContainer from './AddEditFilterContainer';
import InfoModal from './InfoModal';

export interface FilterModalProps {
  toggleIsOpen(): void;
  filters: MessageFilters[];
  addFilter(values: MessageFilters): void;
  deleteFilter(index: number): void;
  activeFilterHandler(activeFilter: MessageFilters, index: number): void;
  toggleEditModal(): void;
  editFilter(value: FilterEdit): void;
  isSavedFiltersOpen: boolean;
  onClickSavedFilters(newValue: boolean): void;
  activeFilter?: MessageFilters;
}

export interface AddMessageFilters extends MessageFilters {
  saveFilter: boolean;
}

const AddFilter: React.FC<FilterModalProps> = ({
  toggleIsOpen,
  filters,
  addFilter,
  deleteFilter,
  activeFilterHandler,
  toggleEditModal,
  editFilter,
  isSavedFiltersOpen,
  onClickSavedFilters,
  activeFilter,
}) => {
  const { value: isOpen, toggle } = useBoolean();

  const onSubmit = React.useCallback(
    async (values: AddMessageFilters) => {
      const isFilterExists = filters.some(
        (filter) => filter.name === values.name
      );

      if (isFilterExists) {
        showAlert('error', {
          id: '',
          title: 'Validation Error',
          message: 'Filter with the same name already exists',
        });
        return;
      }

      const data = { ...values };
      if (data.saveFilter) {
        addFilter(data);
      } else {
        // other case is not applying the filter
        const dataCodeLabel =
          data.code.length > 16 ? `${data.code.slice(0, 16)}...` : data.code;
        data.name = data.name || dataCodeLabel;

        activeFilterHandler(data, -1);
        toggleIsOpen();
      }
    },
    [activeFilterHandler, addFilter, toggleIsOpen]
  );
  return (
    <>
      <S.FilterTitle>
        Add filter
        <div>
          <S.QuestionIconContainer
            type="button"
            aria-label="info"
            onClick={toggle}
          >
            <QuestionIcon />
          </S.QuestionIconContainer>
          {isOpen && <InfoModal toggleIsOpen={toggle} />}
        </div>
      </S.FilterTitle>
      {isSavedFiltersOpen ? (
        <SavedFilters
          deleteFilter={deleteFilter}
          activeFilterHandler={activeFilterHandler}
          closeModal={toggleIsOpen}
          onGoBack={() => onClickSavedFilters(!onClickSavedFilters)}
          filters={filters}
          onEdit={(index: number, filter: MessageFilters) => {
            toggleEditModal();
            editFilter({ index, filter });
          }}
          activeFilter={activeFilter}
        />
      ) : (
        <>
          <S.SavedFiltersTextContainer
            onClick={() => onClickSavedFilters(!isSavedFiltersOpen)}
          >
            <SavedIcon /> <S.SavedFiltersText>Saved Filters</S.SavedFiltersText>
          </S.SavedFiltersTextContainer>
          <AddEditFilterContainer
            cancelBtnHandler={toggleIsOpen}
            submitBtnText="Add filter"
            submitCallback={onSubmit}
            isAdd
          />
        </>
      )}
    </>
  );
};

export default AddFilter;
