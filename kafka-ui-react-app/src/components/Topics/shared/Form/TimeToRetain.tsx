import React from 'react';
import prettyMilliseconds from 'pretty-ms';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { MILLISECONDS_IN_WEEK, MILLISECONDS_IN_SECOND } from 'lib/constants';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import styled from 'styled-components';
import { Colors } from 'theme/theme';

import TimeToRetainBtns from './TimeToRetainBtns';

interface Props {
  isSubmitting: boolean;
}

const TimeToRetainLabel = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  & > span {
    font-size: 12px;
    color: ${Colors.neutral[50]};
  }
`;

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
      <TimeToRetainLabel>
        <InputLabel>Time to retain data (in ms)</InputLabel>
        {valueHint && <span>{valueHint}</span>}
      </TimeToRetainLabel>
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
