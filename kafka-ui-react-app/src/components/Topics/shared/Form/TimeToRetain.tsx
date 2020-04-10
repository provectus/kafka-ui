import React from 'react';
import prettyMilliseconds from 'pretty-ms';
import { useFormContext, ErrorMessage } from 'react-hook-form';
import { MILLISECONDS_IN_WEEK } from 'lib/constants';

const MILLISECONDS_IN_SECOND = 1000;

interface Props {
  isSubmitting: boolean;
}

const TimeToRetain: React.FC<Props> = ({
  isSubmitting,
}) => {
  const { register, errors, watch } = useFormContext();
  const defaultValue = MILLISECONDS_IN_WEEK;
  const name: string = 'retentionMs';
  const watchedValue: any = watch(name, defaultValue.toString());

  const valueHint = React.useMemo(() => {
    const value = parseInt(watchedValue, 10);
    return value >= MILLISECONDS_IN_SECOND ? prettyMilliseconds(value) : false;
  }, [watchedValue])

  return (
    <>
      <label className="label">
        Time to retain data (in ms)
      </label>
      <input
        className="input"
        type="number"
        defaultValue={defaultValue}
        name={name}
        ref={register(
          { min: { value: -1, message: 'must be greater than or equal to -1' }}
        )}
        disabled={isSubmitting}
      />
      <p className="help is-danger">
        <ErrorMessage errors={errors} name={name}/>
      </p>
      {
        valueHint &&
        <p className="help is-info">
          {valueHint}
        </p>
      }
    </>
  );
}

export default TimeToRetain;
