import styled from 'styled-components';
import DatePicker from 'react-datepicker';

export const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.layout.stuffBorderColor};
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const Metric = styled.div`
  color: ${({ theme }) => theme.metrics.filters.color.normal};
  font-size: 12px;
  display: flex;
`;

export const MetricIcon = styled.div`
  color: ${({ theme }) => theme.metrics.filters.color.icon};
  padding-right: 6px;
  height: 12px;
`;

export const MetaMessage = styled.div.attrs({
  role: 'contentLoader',
})`
  color: ${({ theme }) => theme.heading.h3.color};
  font-size: 12px;
  display: flex;
  gap: 8px;
`;

export const StopLoading = styled.div`
  color: ${({ theme }) => theme.pageLoader.borderColor};
  cursor: pointer;
`;

export const FilterRow = styled.div`
  margin: 8px 0 8px;
`;
export const FilterFooter = styled.div`
  display: flex;
  gap: 8px;
  justify-content: end;
  margin: 16px 0;
`;

export const DatePickerInput = styled(DatePicker)`
  height: 32px;
  border: 1px ${(props) => props.theme.select.borderColor.normal} solid;
  border-radius: 4px;
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
