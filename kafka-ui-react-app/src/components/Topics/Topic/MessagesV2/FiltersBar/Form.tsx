import React from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
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
import MultiSelect from 'components/common/MultiSelect/MultiSelect.styled';

import * as S from './FiltersBar.styled';
import { getSelectedPartitionsOptionFromSeekToParam, setSeekTo } from './utils';

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

  const methods = useForm<FormValues>({
    defaultValues: {
      mode: searchParams.get('m') || 'newest',
      offset: searchParams.get('o') || '0',
      time: searchParams.get('t')
        ? new Date(Number(searchParams.get('t')))
        : Date.now(),
      keySerde: searchParams.get('keySerde') as string,
      valueSerde: searchParams.get('valueSerde') as string,
      partitions: getSelectedPartitionsOptionFromSeekToParam(
        searchParams,
        partitions
      ),
    } as FormValues,
  });

  const {
    handleSubmit,
    watch,
    control,
    getValues,
    formState: { isDirty },
    reset,
  } = methods;

  const mode = watch('mode');

  const partitionMap = React.useMemo(
    () =>
      partitions.reduce<Record<string, Partition>>(
        (acc, partition) => ({
          ...acc,
          [partition.partition]: partition,
        }),
        {}
      ),
    [partitions]
  );

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

    const selectedPartitions = values.partitions.map((partition) => {
      return partitionMap[partition.value];
    });

    setSeekTo(searchParams, selectedPartitions);
    setSearchParams(searchParams);
    reset(values);
  };

  const handleRefresh: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();
    searchParams.set('a', `${Number(searchParams.get('a') || 0) + 1}`);
    setSearchParams(searchParams);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <S.FilterRow>
          <InputLabel>Mode</InputLabel>
          <Controller
            control={control}
            name="mode"
            defaultValue={getValues('mode')}
            render={({ field }) => (
              <Select
                selectSize="M"
                minWidth="100%"
                value={field.value}
                options={getModeOptions()}
                isLive={mode === 'live' && isFetching}
                onChange={field.onChange}
              />
            )}
          />
        </S.FilterRow>
        {['sinceTime', 'untilTime'].includes(mode) && (
          <S.FilterRow>
            <InputLabel>Time</InputLabel>
            <Controller
              control={control}
              name="time"
              defaultValue={getValues('time')}
              render={({ field }) => (
                <S.DatePickerInput
                  selected={field.value}
                  onChange={field.onChange}
                  showTimeInput
                  timeInputLabel="Time:"
                  dateFormat="MMMM d, yyyy HH:mm"
                  placeholderText="Select timestamp"
                />
              )}
            />
          </S.FilterRow>
        )}
        {['fromOffset', 'toOffset'].includes(mode) && (
          <S.FilterRow>
            <InputLabel>Offset</InputLabel>
            <Input
              type="text"
              inputSize="M"
              placeholder="Offset"
              name="offset"
            />
          </S.FilterRow>
        )}
        <S.FilterRow>
          <InputLabel>Key Serde</InputLabel>
          <Controller
            control={control}
            name="keySerde"
            defaultValue={getValues('keySerde')}
            render={({ field }) => (
              <Select
                id="selectKeySerdeOptions"
                aria-labelledby="selectKeySerdeOptions"
                onChange={field.onChange}
                options={getSerdeOptions(serdes.key || [])}
                value={field.value}
                selectSize="M"
                minWidth="100%"
              />
            )}
          />
        </S.FilterRow>
        <S.FilterRow>
          <InputLabel>Content Serde</InputLabel>
          <Controller
            control={control}
            name="valueSerde"
            defaultValue={getValues('valueSerde')}
            render={({ field }) => (
              <Select
                id="selectValueSerdeOptions"
                aria-labelledby="selectValueSerdeOptions"
                onChange={field.onChange}
                options={getSerdeOptions(serdes.value || [])}
                value={field.value}
                selectSize="M"
                minWidth="100%"
              />
            )}
          />
        </S.FilterRow>
        <S.FilterRow>
          <InputLabel>Partitions</InputLabel>
          <Controller
            control={control}
            name="partitions"
            render={({ field }) => (
              <MultiSelect
                options={partitions.map((p) => ({
                  label: `Partition #${p.partition.toString()}`,
                  value: p.partition,
                }))}
                value={field.value}
                onChange={field.onChange}
                labelledBy="Select partitions"
              />
            )}
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
    </FormProvider>
  );
};

export default Form;
