import Input from 'components/common/Input/Input';
import Select from 'components/common/Select/Select';
import styled, { css } from 'styled-components';
import DatePicker from 'react-datepicker';
import EditIcon from 'components/common/Icons/EditIcon';
import closeIcon from 'components/common/Icons/CloseIcon';

interface SavedFilterProps {
  selected: boolean;
}
interface MessageLoadingProps {
  isLive: boolean;
}

interface MessageLoadingSpinnerProps {
  isFetching: boolean;
}

export const FiltersWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: 16px;
  padding-right: 16px;

  & > div:first-child {
    display: flex;
    justify-content: space-between;
    padding-top: 2px;
    align-items: flex-end;
  }
`;

export const FilterInputs = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  width: 90%;
  flex-wrap: wrap;
`;

export const SeekTypeSelectorWrapper = styled.div`
  display: flex;
  & .select-wrapper {
    width: 40% !important;
    & > select {
      border-radius: 4px 0 0 4px !important;
    }
  }
`;

export const OffsetSelector = styled(Input)`
  border-radius: 0 4px 4px 0 !important;
  &::placeholder {
    color: ${({ theme }) => theme.input.color.normal};
  }
`;

export const DatePickerInput = styled(DatePicker)`
  height: 32px;
  border: 1px ${({ theme }) => theme.select.borderColor.normal} solid;
  border-left: none;
  border-radius: 0 4px 4px 0;
  font-size: 14px;
  width: 100%;
  padding-left: 12px;
  background-color: ${({ theme }) => theme.input.backgroundColor.normal};
  color: ${({ theme }) => theme.input.color.normal};
  &::placeholder {
    color: ${({ theme }) => theme.input.color.normal};
  }

  background-image: url('data:image/svg+xml,%3Csvg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M1 1L5 5L9 1" stroke="%23454F54"/%3E%3C/svg%3E%0A') !important;
  background-repeat: no-repeat !important;
  background-position-x: 96% !important;
  background-position-y: 55% !important;
  appearance: none !important;

  &:hover {
    cursor: pointer;
  }
  &:focus {
    outline: none;
  }
`;

export const FiltersMetrics = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 22px;
  padding-top: 16px;
  padding-bottom: 16px;
`;
export const Message = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.metrics.filters.color.normal};
`;
export const Metric = styled.div`
  color: ${({ theme }) => theme.metrics.filters.color.normal};
  font-size: 12px;
  display: flex;
`;

export const MetricsIcon = styled.div`
  color: ${({ theme }) => theme.metrics.filters.color.icon};
  padding-right: 6px;
  height: 12px;
`;

export const ClearAll = styled.div`
  color: ${({ theme }) => theme.metrics.filters.color.normal};
  font-size: 12px;
  cursor: pointer;
  line-height: 32px;
  margin-left: 8px;
`;

export const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

export const ListItem = styled.li`
  font-size: 12px;
  font-weight: 400;
  margin: 4px 0;
  line-height: 1.5;
  color: ${({ theme }) => theme.table.td.color.normal};
`;

export const InfoParagraph = styled.div`
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.table.td.color.normal};
`;

export const MessageFilterModal = styled.div`
  height: auto;
  width: 560px;
  border-radius: 8px;
  background: ${({ theme }) => theme.modal.backgroundColor};
  position: absolute;
  left: 25%;
  border: 1px solid ${({ theme }) => theme.modal.border.contrast};
  box-shadow: ${({ theme }) => theme.modal.shadow};
  padding: 16px;
  z-index: 1;
`;

export const InfoModal = styled.div`
  height: auto;
  width: 560px;
  border-radius: 8px;
  background: ${({ theme }) => theme.modal.backgroundColor};
  position: absolute;
  left: 25%;
  border: 1px solid ${({ theme }) => theme.modal.border.contrast};
  box-shadow: ${({ theme }) => theme.modal.shadow};
  padding: 32px;
  z-index: 1;
`;

export const QuestionIconContainer = styled.button`
  cursor: pointer;
  padding: 0;
  background: none;
  border: none;
`;

export const FilterTitle = styled.h3`
  line-height: 32px;
  font-size: 20px;
  margin-bottom: 40px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.modal.color};
  &:after {
    content: '';
    width: calc(100% + 32px);
    height: 1px;
    position: absolute;
    top: 40px;
    left: -16px;
    display: inline-block;
    background-color: ${({ theme }) => theme.modal.border.top};
  }
`;

export const CreatedFilter = styled.p`
  margin: 25px 0 10px;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.savedFilter.color};
`;

export const NoSavedFilter = styled.p`
  color: ${({ theme }) => theme.savedFilter.color};
`;
export const SavedFiltersContainer = styled.div`
  overflow-y: auto;
  height: 195px;
  justify-content: space-around;
  padding-left: 10px;
`;

export const SavedFilterName = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.savedFilter.filterName};
`;

export const FilterButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  gap: 10px;
  padding-top: 16px;
  position: relative;
  &:before {
    content: '';
    width: calc(100% + 32px);
    height: 1px;
    position: absolute;
    top: 0;
    left: -16px;
    display: inline-block;
    background-color: ${({ theme }) => theme.modal.border.bottom};
  }
`;

export const ActiveSmartFilterWrapper = styled.div`
  padding: 8px 0 5px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
`;

export const DeleteSavedFilter = styled.div.attrs({ role: 'deleteIcon' })`
  margin-top: 2px;
  cursor: pointer;
  color: ${({ theme }) => theme.icons.deleteIcon};
`;

export const FilterEdit = styled.div`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
`;

export const FilterOptions = styled.div`
  display: none;
  width: 50px;
  justify-content: space-between;
  color: ${({ theme }) => theme.editFilter.textColor};
`;

export const SavedFilter = styled.div.attrs({
  role: 'savedFilter',
})<SavedFilterProps>`
  display: flex;
  justify-content: space-between;
  padding-right: 5px;
  height: 32px;
  align-items: center;
  cursor: pointer;
  border-top: 1px solid ${({ theme }) => theme.panelColor.borderTop};
  &:hover ${FilterOptions} {
    display: flex;
  }
  &:hover {
    background: ${({ theme }) => theme.layout.stuffColor};
  }
  background: ${({ selected, theme }) =>
    selected ? theme.layout.stuffColor : theme.modal.backgroundColor};
`;

export const ActiveSmartFilter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  color: ${({ theme }) => theme.activeFilter.color};
  background: ${({ theme }) => theme.activeFilter.backgroundColor};
  border-radius: 4px;
  font-size: 14px;
  line-height: 20px;
`;

export const EditSmartFilterIcon = styled.div(
  ({ theme: { icons } }) => css`
    color: ${icons.editIcon.normal};
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    cursor: pointer;
    border-left: 1px solid ${icons.editIcon.border};

    &:hover {
      ${EditIcon} {
        fill: ${icons.editIcon.hover};
      }
    }

    &:active {
      ${EditIcon} {
        fill: ${icons.editIcon.active};
      }
    }
  `
);

export const SmartFilterName = styled.div`
  padding: 0 8px;
  min-width: 32px;
`;

export const DeleteSmartFilterIcon = styled.div(
  ({ theme: { icons } }) => css`
    color: ${icons.closeIcon.normal};
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    cursor: pointer;
    border-left: 1px solid ${icons.closeIcon.border};

    svg {
      height: 14px;
      width: 14px;
    }

    &:hover {
      ${closeIcon} {
        fill: ${icons.closeIcon.hover};
      }
    }

    &:active {
      ${closeIcon} {
        fill: ${icons.closeIcon.active};
      }
    }
  `
);

export const MessageLoading = styled.div.attrs({
  role: 'contentLoader',
})<MessageLoadingProps>`
  color: ${({ theme }) => theme.heading.h3.color};
  font-size: ${({ theme }) => theme.heading.h3.fontSize};
  display: ${({ isLive }) => (isLive ? 'flex' : 'none')};
  justify-content: space-around;
  width: 250px;
`;

export const StopLoading = styled.div`
  color: ${({ theme }) => theme.pageLoader.borderColor};
  font-size: ${({ theme }) => theme.heading.h3.fontSize};
  cursor: pointer;
`;

export const MessageLoadingSpinner = styled.div<MessageLoadingSpinnerProps>`
  display: ${({ isFetching }) => (isFetching ? 'block' : 'none')};
  border: 3px solid ${({ theme }) => theme.pageLoader.borderColor};
  border-bottom: 3px solid ${({ theme }) => theme.pageLoader.borderBottomColor};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1.3s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const SavedFiltersTextContainer = styled.div.attrs({
  role: 'savedFilterText',
})`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 15px;
`;

const textStyle = css`
  font-size: 14px;
  color: ${({ theme }) => theme.editFilter.textColor};
  font-weight: 500;
`;

export const SavedFiltersText = styled.div`
  ${textStyle};
  margin-left: 7px;
`;

export const BackToCustomText = styled.div`
  ${textStyle};
  cursor: pointer;
`;

export const SeekTypeSelect = styled(Select)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  user-select: none;
`;

export const Serdes = styled.div`
  display: flex;
  gap: 24px;
  padding: 8px 0;
`;
