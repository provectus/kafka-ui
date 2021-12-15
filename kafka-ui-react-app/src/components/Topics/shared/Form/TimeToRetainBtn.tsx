import React from 'react';
import { useFormContext } from 'react-hook-form';
import { MILLISECONDS_IN_WEEK } from 'lib/constants';
import styled from 'styled-components';
import { Colors } from 'theme/theme';

interface Props {
  inputName: string;
  text: string;
  value: number;
}

const TimeToRetainBtnStyled = styled.button<{ isActive: boolean }>`
  background-color: ${(props) =>
    props.isActive ? Colors.neutral[10] : Colors.neutral[0]};
  height: 32px;
  width: 46px;
  border: 1px solid
    ${(props) => (props.isActive ? Colors.neutral[90] : Colors.neutral[40])};
  border-radius: 6px;
  &:hover {
    cursor: pointer;
  }
`;

const TimeToRetainBtn: React.FC<Props> = ({ inputName, text, value }) => {
  const { setValue, watch } = useFormContext();
  const watchedValue = watch(inputName, MILLISECONDS_IN_WEEK.toString());

  return (
    <TimeToRetainBtnStyled
      isActive={watchedValue === value}
      type="button"
      onClick={() => setValue(inputName, value)}
    >
      {text}
    </TimeToRetainBtnStyled>
  );
};

export default TimeToRetainBtn;
