import styled from 'styled-components';
import DatePicker from 'react-datepicker';

export const OffsetsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
`;

export const DatePickerInput = styled(DatePicker).attrs({
  showTimeInput: true,
  timeInputLabel: 'Time:',
  dateFormat: 'MMMM d, yyyy h:mm aa',
})`
  height: 40px;
  border: 1px ${({ theme }) => theme.select.borderColor.normal} solid;
  border-radius: 4px;
  font-size: 14px;
  width: 270px;
  padding-left: 12px;
  background-color: ${({ theme }) => theme.input.backgroundColor.normal};
  color: ${({ theme }) => theme.input.color.normal};
  &::placeholder {
    color: ${({ theme }) => theme.input.color.normal};
  }
  &:hover {
    cursor: pointer;
  }
  &:focus {
    outline: none;
  }
`;
