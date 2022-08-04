import React from 'react';
import { MILLISECONDS_IN_DAY } from 'lib/constants';
import styled from 'styled-components';

import TimeToRetainBtn from './TimeToRetainBtn';

export interface Props {
  name: string;
  value: string;
}

const TimeToRetainBtnsWrapper = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 8px;
`;

const TimeToRetainBtns: React.FC<Props> = ({ name }) => (
  <TimeToRetainBtnsWrapper>
    <TimeToRetainBtn
      text="12 hours"
      inputName={name}
      value={MILLISECONDS_IN_DAY / 2}
    />
    <TimeToRetainBtn
      text="1 day"
      inputName={name}
      value={MILLISECONDS_IN_DAY}
    />
    <TimeToRetainBtn
      text="2 days"
      inputName={name}
      value={MILLISECONDS_IN_DAY * 2}
    />
    <TimeToRetainBtn
      text="7 days"
      inputName={name}
      value={MILLISECONDS_IN_DAY * 7}
    />
    <TimeToRetainBtn
      text="4 weeks"
      inputName={name}
      value={MILLISECONDS_IN_DAY * 7 * 4}
    />
  </TimeToRetainBtnsWrapper>
);

export default TimeToRetainBtns;
