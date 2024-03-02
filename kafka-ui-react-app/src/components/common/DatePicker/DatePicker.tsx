import React from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';

import * as S from './DatePicker.styled';

const DatePicker: React.FC<ReactDatePickerProps> = ({ inline, ...props }) => {
  return (
    <S.DatePickerWrapper inline={inline}>
      <ReactDatePicker {...props} inline calendarClassName="calendar" />
    </S.DatePickerWrapper>
  );
};

export default DatePicker;
