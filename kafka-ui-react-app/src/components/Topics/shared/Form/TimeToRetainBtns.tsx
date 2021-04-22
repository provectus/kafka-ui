import React from 'react';
import { MILLISECONDS_IN_DAY } from 'lib/constants';

import TimeToRetainBtn from './TimeToRetainBtn';

interface Props {
  name: string;
  value: string;
}

const TimeToRetainBtns: React.FC<Props> = ({ name }) => (
  <div className="buttons are-small">
    <TimeToRetainBtn
      text="12h"
      inputName={name}
      value={MILLISECONDS_IN_DAY / 2}
    />
    <TimeToRetainBtn text="1d" inputName={name} value={MILLISECONDS_IN_DAY} />
    <TimeToRetainBtn
      text="2d"
      inputName={name}
      value={MILLISECONDS_IN_DAY * 2}
    />
    <TimeToRetainBtn
      text="7d"
      inputName={name}
      value={MILLISECONDS_IN_DAY * 7}
    />
    <TimeToRetainBtn
      text="4w"
      inputName={name}
      value={MILLISECONDS_IN_DAY * 7 * 24}
    />
  </div>
);

export default TimeToRetainBtns;
