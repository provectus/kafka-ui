import Input from 'components/common/Input/Input';
import Select from 'components/common/Select/Select';
import styled, { css } from 'styled-components';
import DatePicker from 'react-datepicker';

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
    padding-top: 16px;
  }
`;

export const FilterInputs = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 90%;

  & > div:first-child {
    width: 25%;
  }
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
  border-left: none;
`;

export const DatePickerInput = styled(DatePicker)`
  height: 32px;
  border: 1px ${(props) => props.theme.select.borderColor.normal} solid;
  border-left: none;
  border-radius: 0 4px 4px 0;
  font-size: 14px;
  width: 100%;
  padding-left: 12px;
  color: ${(props) => props.theme.select.color.normal};

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

export const ClearAll = styled.span`
  color: ${({ theme }) => theme.metrics.filters.color.normal};
  font-size: 12px;
  cursor: pointer;
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
  border: 1px solid ${({ theme }) => theme.breadcrumb};
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
  border: 1px solid ${({ theme }) => theme.breadcrumb};
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
  &:after {
    content: '';
    width: calc(100% + 32px);
    height: 1px;
    position: absolute;
    top: 40px;
    left: -16px;
    display: inline-block;
    background-color: #f1f2f3;
  }
`;

export const CreatedFilter = styled.p`
  margin: 25px 0 10px;
  color: ${({ theme }) => theme.breadcrumb};
  font-size: 14px;
  line-height: 20px;
`;

export const SavedFiltersContainer = styled.div`
  overflow-y: auto;
  height: 195px;
  // display: flex;
  // flex-direction: column;
  justify-content: space-around;
  padding-left: 10px;
  // gap: 10px;
`;

export const SavedFilterName = styled.div`
  font-size: 14px;
  line-height: 20px;
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
    background-color: #f1f2f3;
  }
`;

export const ActiveSmartFilterWrapper = styled.div`
  padding: 5px 0;
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
  color: ${({ theme }) => theme.editFilterText.color};
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
  border-top: 1px solid #f1f2f3;
  &:hover ${FilterOptions} {
    display: flex;
  }
  &:hover {
    background: ${({ theme }) => theme.layout.stuffColor};
  }
  background: ${(props) =>
    props.selected ? props.theme.layout.stuffColor : props.theme.panelColor};
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const ActiveSmartFilter = styled.div`
  border-radius: 4px;
  min-width: 115px;
  height: 24px;
  background: ${({ theme }) => theme.layout.stuffColor};
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.input.label.color};
  padding: 16px 8px;
`;

export const DeleteSavedFilterIcon = styled.div`
  color: ${({ theme }) => theme.icons.closeIcon};
  display: flex;
  align-items: center;
  padding-left: 6px;
  height: 24px;
  cursor: pointer;
  margin-left: 4px;
`;

export const ConfirmDeletionText = styled.h3`
  color: ${({ theme }) => theme.modal.deletionTextColor};
  font-size: 14px;
  line-height: 20px;
  padding: 16px 0;
`;

export const MessageLoading = styled.div.attrs({
  role: 'contentLoader',
})<MessageLoadingProps>`
  color: ${({ theme }) => theme.heading.h3.color};
  font-size: ${({ theme }) => theme.heading.h3.fontSize};
  display: ${(props) => (props.isLive ? 'flex' : 'none')};
  justify-content: space-around;
  width: 250px;
`;

export const StopLoading = styled.div`
  color: ${({ theme }) => theme.pageLoader.borderColor};
  font-size: ${({ theme }) => theme.heading.h3.fontSize};
  cursor: pointer;
`;

export const MessageLoadingSpinner = styled.div<MessageLoadingSpinnerProps>`
  display: ${(props) => (props.isFetching ? 'block' : 'none')};
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
  color: ${({ theme }) => theme.editFilterText.color};
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
