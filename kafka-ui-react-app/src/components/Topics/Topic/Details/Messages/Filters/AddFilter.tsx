import React from 'react';
import * as S from 'components/Topics/Topic/Details/Messages/Filters/Filters.styled';
import { MessageFilters } from 'components/Topics/Topic/Details/Messages/Filters/Filters';
import { FilterEdit } from 'components/Topics/Topic/Details/Messages/Filters/FilterModal';
import SavedFilters from 'components/Topics/Topic/Details/Messages/Filters/SavedFilters';
import SavedIcon from 'components/common/Icons/SavedIcon';
import QuestionIcon from 'components/common/Icons/QuestionIcon';
import useModal from 'lib/hooks/useModal';

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
}) => {
  const [savedFilterState, setSavedFilterState] =
    React.useState<boolean>(false);
  const { isOpen, toggle } = useModal();

  const onSubmit = React.useCallback(
    async (values: AddMessageFilters) => {
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
      {savedFilterState ? (
        <SavedFilters
          deleteFilter={deleteFilter}
          activeFilterHandler={activeFilterHandler}
          closeModal={toggleIsOpen}
          onGoBack={() => setSavedFilterState(false)}
          filters={filters}
          onEdit={(index: number, filter: MessageFilters) => {
            toggleEditModal();
            editFilter({ index, filter });
          }}
        />
      ) : (
        <>
          <S.SavedFiltersTextContainer
            onClick={() => setSavedFilterState(true)}
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
