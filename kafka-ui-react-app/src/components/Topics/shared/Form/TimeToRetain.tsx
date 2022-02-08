import React from 'react';
import prettyMilliseconds from 'pretty-ms';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { MILLISECONDS_IN_WEEK, MILLISECONDS_IN_SECOND } from 'lib/constants';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';

import * as S from './TopicForm.styled';
import TimeToRetainBtns from './TimeToRetainBtns';

interface Props {
  isSubmitting: boolean;
}

const TimeToRetain: React.FC<Props> = ({ isSubmitting }) => {
  const {
    watch,
    formState: { errors },
  } = useFormContext();
  const defaultValue = MILLISECONDS_IN_WEEK;
  const name = 'retentionMs';
  const watchedValue = watch(name, defaultValue.toString());

  const valueHint = React.useMemo(() => {
    const value = parseInt(watchedValue, 10);
    return value >= MILLISECONDS_IN_SECOND ? prettyMilliseconds(value) : false;
  }, [watchedValue]);

  return (
    <>
      <S.Label>
        <InputLabel htmlFor="timeToRetain">
          Time to retain data (in ms)
        </InputLabel>
        {valueHint && <span>{valueHint}</span>}
      </S.Label>
      <Input
        id="timeToRetain"
        type="number"
        defaultValue={defaultValue}
        name={name}
        hookFormOptions={{
          min: { value: -1, message: 'must be greater than or equal to -1' },
        }}
        disabled={isSubmitting}
      />

      <FormError>
        <ErrorMessage errors={errors} name={name} />
      </FormError>

      <TimeToRetainBtns name={name} value={watchedValue} />
    </>
  );
};

export default TimeToRetain;
