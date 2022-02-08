import React from 'react';
import { useFormContext } from 'react-hook-form';
import { MILLISECONDS_IN_WEEK } from 'lib/constants';

import * as S from './TopicForm.styled';

interface Props {
  inputName: string;
  text: string;
  value: number;
}

const TimeToRetainBtn: React.FC<Props> = ({ inputName, text, value }) => {
  const { setValue, watch } = useFormContext();
  const watchedValue = watch(inputName, MILLISECONDS_IN_WEEK.toString());

  return (
    <S.Button
      isActive={watchedValue === value}
      type="button"
      onClick={() => setValue(inputName, value)}
    >
      {text}
    </S.Button>
  );
};

export default TimeToRetainBtn;
