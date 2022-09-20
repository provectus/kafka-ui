import React from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import Input from 'components/common/Input/Input';
import { ConsumingMode } from 'lib/hooks/api/topicMessages';
import Select from 'components/common/Select/Select';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { Option } from 'react-multi-select-component';
import { Button } from 'components/common/Button/Button';
import { Partition } from 'generated-sources';
import { getModeOptions } from 'components/Topics/Topic/MessagesV2/utils/consumingModes';

import * as S from './FiltersBar.styled';
import { setSeekTo } from './utils';

type FormValues = {
  mode: ConsumingMode;
  offset: string;
  time: Date;
  partitions: Option[];
};

const Form: React.FC<{ isFetching: boolean; partitions: Partition[] }> = ({
  isFetching,
  partitions,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      mode: searchParams.get('m') || 'newest',
      offset: searchParams.get('o') || '0',
      time: searchParams.get('t')
        ? new Date(Number(searchParams.get('t')))
        : Date.now(),
    } as FormValues,
  });
  const mode = watch('mode');
  const offset = watch('offset');
  const time = watch('time');

  const onSubmit = (values: FormValues) => {
    searchParams.set('m', values.mode);
    searchParams.delete('o');
    searchParams.delete('t');
    searchParams.delete('a');
    searchParams.delete('page');
    if (values.mode === 'fromOffset' || values.mode === 'toOffset') {
      searchParams.set('o', values.offset);
    } else if (values.mode === 'sinceTime' || values.mode === 'untilTime') {
      searchParams.set('t', `${values.time.getTime()}`);
    }
    setSeekTo(searchParams, partitions);
    setSearchParams(searchParams);
    reset(values);
  };

  const handleTimestampChange = (value: Date | null) => {
    if (value) {
      setValue('time', value, { shouldDirty: true });
    }
  };
  const handleOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('offset', e.target.value, { shouldDirty: true });
  };
  const handleRefresh: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    searchParams.set('a', `${Number(searchParams.get('a') || 0) + 1}`);
    setSearchParams(searchParams);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <S.FilterRow>
        <InputLabel>Mode</InputLabel>
        <Select
          selectSize="M"
          minWidth="100%"
          value={mode}
          options={getModeOptions()}
          isLive={mode === 'live' && isFetching}
          onChange={(option: string | number) =>
            setValue('mode', option as ConsumingMode, { shouldDirty: true })
          }
        />
      </S.FilterRow>
      {['sinceTime', 'untilTime'].includes(mode) && (
        <S.FilterRow>
          <InputLabel>Time</InputLabel>
          <S.DatePickerInput
            selected={time}
            onChange={handleTimestampChange}
            showTimeInput
            timeInputLabel="Time:"
            dateFormat="MMMM d, yyyy HH:mm"
            placeholderText="Select timestamp"
          />
        </S.FilterRow>
      )}
      {['fromOffset', 'toOffset'].includes(mode) && (
        <S.FilterRow>
          <InputLabel>Offset</InputLabel>
          <Input
            type="text"
            inputSize="M"
            value={offset}
            placeholder="Offset"
            onChange={handleOffsetChange}
          />
        </S.FilterRow>
      )}
      <S.FilterFooter>
        <Button
          buttonType="secondary"
          disabled={!isDirty}
          buttonSize="S"
          onClick={() => reset()}
        >
          Clear All
        </Button>
        <Button
          buttonType="secondary"
          buttonSize="S"
          disabled={isDirty || isFetching}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
        <Button buttonType="primary" disabled={!isDirty} buttonSize="S">
          Apply Mode
        </Button>
      </S.FilterFooter>
    </form>
  );
};

export default Form;
