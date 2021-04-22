import React from 'react';
import prettyMilliseconds from 'pretty-ms';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { MILLISECONDS_IN_WEEK, MILLISECONDS_IN_SECOND } from 'lib/constants';

import TimeToRetainBtns from './TimeToRetainBtns';

interface Props {
  isSubmitting: boolean;
}

const TimeToRetain: React.FC<Props> = ({ isSubmitting }) => {
  const { register, errors, watch } = useFormContext();
  const defaultValue = MILLISECONDS_IN_WEEK;
  const name = 'retentionMs';
  const watchedValue = watch(name, defaultValue.toString());

  const valueHint = React.useMemo(() => {
    const value = parseInt(watchedValue, 10);
    return value >= MILLISECONDS_IN_SECOND ? prettyMilliseconds(value) : false;
  }, [watchedValue]);

  return (
    <>
      <label
        className="label is-flex"
        style={{ justifyContent: 'space-between' }}
      >
        <div>Time to retain data (in ms)</div>
        {valueHint && <span className="has-text-info">{valueHint}</span>}
      </label>
      <input
        className="input"
        id="timeToRetain"
        type="number"
        defaultValue={defaultValue}
        name={name}
        ref={register({
          min: { value: -1, message: 'must be greater than or equal to -1' },
        })}
        disabled={isSubmitting}
      />

      <p className="help is-danger">
        <ErrorMessage errors={errors} name={name} />
      </p>

      <TimeToRetainBtns name={name} value={watchedValue} />
    </>
  );
};

export default TimeToRetain;
