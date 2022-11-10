import React from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import Input from 'components/common/Input/Input';
import { ConsumingMode, useSerdes } from 'lib/hooks/api/topicMessages';
import Select from 'components/common/Select/Select';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { Option } from 'react-multi-select-component';
import { Button } from 'components/common/Button/Button';
import { Partition, SerdeUsage } from 'generated-sources';
import { getModeOptions } from 'components/Topics/Topic/MessagesV2/utils/consumingModes';
import { getSerdeOptions } from 'components/Topics/Topic/SendMessage/utils';
import useAppParams from 'lib/hooks/useAppParams';
import { RouteParamsClusterTopic } from 'lib/paths';

import * as S from './FiltersBar.styled';
import { setSeekTo } from './utils';

type FormValues = {
  mode: ConsumingMode;
  offset: string;
  time: Date;
  partitions: Option[];
  keySerde: string;
  valueSerde: string;
};

const Form: React.FC<{ isFetching: boolean; partitions: Partition[] }> = ({
  isFetching,
  partitions,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const routerProps = useAppParams<RouteParamsClusterTopic>();
  const { data: serdes = {} } = useSerdes({
    ...routerProps,
    use: SerdeUsage.DESERIALIZE,
  });

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
      keySerde: searchParams.get('keySerde') as string,
      valueSerde: searchParams.get('valueSerde') as string,
    } as FormValues,
  });
  const mode = watch('mode');
  const offset = watch('offset');
  const time = watch('time');
  const keySerde = watch('keySerde');
  const valueSerde = watch('valueSerde');

  const onSubmit = (values: FormValues) => {
    searchParams.set('m', values.mode);
    if (values.keySerde) {
      searchParams.set('keySerde', values.keySerde);
    }
    if (values.valueSerde) {
      searchParams.set('valueSerde', values.valueSerde);
    }
    searchParams.delete('o');
    searchParams.delete('t');
    searchParams.delete('a');
    searchParams.delete('page');
    if (['fromOffset', 'toOffset'].includes(mode)) {
      searchParams.set('o', values.offset);
    } else if (['sinceTime', 'untilTime'].includes(mode)) {
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
  const handleSerdeChange =
    (type: 'keySerde' | 'valueSerde') => (option: string | number) => {
      setValue(type, String(option), { shouldDirty: true });
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
      <S.FilterRow>
        <InputLabel>Key Serde</InputLabel>
        <Select
          id="selectKeySerdeOptions"
          aria-labelledby="selectKeySerdeOptions"
          onChange={handleSerdeChange('keySerde')}
          options={getSerdeOptions(serdes.key || [])}
          value={keySerde}
          selectSize="M"
          minWidth="100%"
        />
      </S.FilterRow>
      <S.FilterRow>
        <InputLabel>Content Serde</InputLabel>
        <Select
          id="selectValueSerdeOptions"
          aria-labelledby="selectValueSerdeOptions"
          onChange={handleSerdeChange('valueSerde')}
          options={getSerdeOptions(serdes.value || [])}
          value={valueSerde}
          selectSize="M"
          minWidth="100%"
        />
      </S.FilterRow>
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
