import React from 'react';
import { useFormContext } from 'react-hook-form';
import cx from 'classnames';
import { MILLISECONDS_IN_WEEK } from 'lib/constants';

interface Props {
  inputName: string;
  text: string;
  value: number;
}

const TimeToRetainBtn: React.FC<Props> = ({ inputName, text, value }) => {
  const { setValue, watch } = useFormContext();
  const watchedValue = watch(inputName, MILLISECONDS_IN_WEEK.toString());

  return (
    <button
      type="button"
      className={cx('button', {
        'is-info': watchedValue === value.toString(),
      })}
      onClick={() => setValue(inputName, value)}
    >
      {text}
    </button>
  );
};

export default TimeToRetainBtn;
