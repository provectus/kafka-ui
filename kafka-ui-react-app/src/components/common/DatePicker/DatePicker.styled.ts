import styled from 'styled-components';

export interface DatePickerProps {
  inline?: boolean;
}

export const DatePickerWrapper = styled.div<DatePickerProps>`
  .calendar {
    background-color: ${({ theme }) =>
      theme.datePicker.color.normal.background};
    border: ${({ inline, theme }) =>
      inline ? 'none' : `1px solid ${theme.datePicker.borderColor.normal}`};
    color: ${({ theme }) => theme.datePicker.color.normal.text};
    font-family: Inter, sans-serif;s
    font-size: 14px;
    .react-datepicker__header {
      background-color: unset;
      border-bottom: none;
    }
    .react-datepicker__current-month, 
    .react-datepicker__day {
      color: ${({ theme }) => theme.datePicker.color.normal.text};
    }
    
    .react-datepicker__current-month {
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      height: 28px;
      padding-top: 4px;
    }

    // .react-datepicker__year-read-view--down-arrow, 
    // .react-datepicker__month-read-view--down-arrow, 
    // .react-datepicker__month-year-read-view--down-arrow, 
    .react-datepicker__navigation-icon::before {
      border-color: ${({ theme }) => theme.datePicker.navigationIcon.color};
      border-width: 2px 2px 0 0;
    }

    .react-datepicker__triangle::after {
      border-bottom-color: ${({ theme }) =>
        theme.datePicker.navigationIcon.color} !important;
    }

    .react-datepicker__navigation {
      top: 8px;
    }

    .react-datepicker__day-names {
      margin-top: 8px;
      font-size: 12px;
      line-height: 16px;
      
    }

    .react-datepicker__day-name {
      color: ${({ theme }) => theme.datePicker.color.gray};
    }

    .react-datepicker__day {
      font-size: 14px;
      line-height: 20px;
      padding: 2px;
    }

    .react-datepicker__day--keyboard-selected {
      background-color: unset;
    }

    .react-datepicker__day--selected {
      background-color: ${({ theme }) =>
        theme.datePicker.color.active.background};
      color: ${({ theme }) => theme.datePicker.color.active.text};
    }

    .react-datepicker__day--disabled {
      color: ${({ theme }) => theme.datePicker.color.gray};
    }

    .react-datepicker-time__caption {
      font-size: 14px;
      line-height: 20px;
    }

    .react-datepicker-time__input {
      min-width: 100px;
      font-size: 14px;
      line-height: 20px;

      input {
        border-radius: 4px;
        border: 1px solid ${({ theme }) => theme.datePicker.borderColor.active};
      }
      
    }
  }
`;
