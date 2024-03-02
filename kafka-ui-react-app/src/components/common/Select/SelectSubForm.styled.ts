import styled from 'styled-components';
import DatePicker from 'react-datepicker';

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

  &::react-datepicker {
    background-color: green;
  }
`;
