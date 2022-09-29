import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConsumerGroupOffsetsResetType } from 'generated-sources';
import { clusterConsumerGroupsPath, ClusterGroupParam } from 'lib/paths';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { MultiSelect, Option } from 'react-multi-select-component';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import groupBy from 'lodash/groupBy';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { ErrorMessage } from '@hookform/error-message';
import Select from 'components/common/Select/Select';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';
import {
  fetchConsumerGroupDetails,
  selectById,
  getAreConsumerGroupDetailsFulfilled,
  getIsOffsetReseted,
  resetConsumerGroupOffsets,
} from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import useAppParams from 'lib/hooks/useAppParams';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';

import * as S from './ResetOffsets.styled';

interface FormType {
  topic: string;
  resetType: ConsumerGroupOffsetsResetType;
  partitionsOffsets: { offset: string | undefined; partition: number }[];
  resetToTimestamp: Date;
}

const ResetOffsets: React.FC = () => {
  const dispatch = useAppDispatch();
  const { consumerGroupID, clusterName } = useAppParams<ClusterGroupParam>();
  const consumerGroup = useAppSelector((state) =>
    selectById(state, consumerGroupID)
  );

  const isFetched = useAppSelector(getAreConsumerGroupDetailsFulfilled);
  const isOffsetReseted = useAppSelector(getIsOffsetReseted);

  React.useEffect(() => {
    dispatch(fetchConsumerGroupDetails({ clusterName, consumerGroupID }));
  }, [clusterName, consumerGroupID, dispatch]);

  const [uniqueTopics, setUniqueTopics] = React.useState<string[]>([]);
  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    []
  );

  const methods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      resetType: ConsumerGroupOffsetsResetType.EARLIEST,
      topic: '',
      partitionsOffsets: [],
    },
  });
  const {
    handleSubmit,
    setValue,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = methods;
  const { fields } = useFieldArray({
    control,
    name: 'partitionsOffsets',
  });
  const resetTypeValue = watch('resetType');
  const topicValue = watch('topic');
  const offsetsValue = watch('partitionsOffsets');

  React.useEffect(() => {
    if (isFetched && consumerGroup?.partitions) {
      setValue('topic', consumerGroup.partitions[0].topic);
      setUniqueTopics(Object.keys(groupBy(consumerGroup.partitions, 'topic')));
    }
  }, [consumerGroup?.partitions, isFetched, setValue]);

  const onSelectedPartitionsChange = (value: Option[]) => {
    clearErrors();
    setValue(
      'partitionsOffsets',
      value.map((partition) => {
        const currentOffset = offsetsValue.find(
          (offset) => offset.partition === partition.value
        );
        return {
          offset: currentOffset ? currentOffset?.offset : undefined,
          partition: partition.value,
        };
      })
    );
    setSelectedPartitions(value);
  };

  React.useEffect(() => {
    onSelectedPartitionsChange([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicValue]);

  const onSubmit = (data: FormType) => {
    const augmentedData = {
      ...data,
      partitions: selectedPartitions.map((partition) => partition.value),
      partitionsOffsets: data.partitionsOffsets as {
        offset: string;
        partition: number;
      }[],
    };
    let isValidAugmentedData = true;
    if (augmentedData.resetType === ConsumerGroupOffsetsResetType.OFFSET) {
      augmentedData.partitionsOffsets.forEach((offset, index) => {
        if (!offset.offset) {
          setError(`partitionsOffsets.${index}.offset`, {
            type: 'manual',
            message: "This field shouldn't be empty!",
          });
          isValidAugmentedData = false;
        }
      });
    } else if (
      augmentedData.resetType === ConsumerGroupOffsetsResetType.TIMESTAMP
    ) {
      if (!augmentedData.resetToTimestamp) {
        setError(`resetToTimestamp`, {
          type: 'manual',
          message: "This field shouldn't be empty!",
        });
        isValidAugmentedData = false;
      }
    }
    if (isValidAugmentedData) {
      dispatch(
        resetConsumerGroupOffsets({
          clusterName,
          consumerGroupID,
          requestBody: augmentedData,
        })
      );
    }
  };

  const navigate = useNavigate();
  React.useEffect(() => {
    if (isOffsetReseted) {
      dispatch(resetLoaderById('consumerGroups/resetConsumerGroupOffsets'));
      navigate('../');
    }
  }, [clusterName, consumerGroupID, dispatch, navigate, isOffsetReseted]);

  if (!isFetched || !consumerGroup) {
    return <PageLoader />;
  }

  return (
    <FormProvider {...methods}>
      <PageHeading
        text="Reset offsets"
        backTo={clusterConsumerGroupsPath(clusterName)}
        backText="Consumers"
      />
      <S.Wrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <S.MainSelectors>
            <div>
              <InputLabel id="topicLabel">Topic</InputLabel>
              <Controller
                control={control}
                name="topic"
                render={({ field: { name, onChange, value } }) => (
                  <Select
                    id="topic"
                    selectSize="M"
                    aria-labelledby="topicLabel"
                    minWidth="100%"
                    name={name}
                    onChange={onChange}
                    defaultValue={value}
                    value={value}
                    options={uniqueTopics.map((topic) => ({
                      value: topic,
                      label: topic,
                    }))}
                  />
                )}
              />
            </div>
            <div>
              <InputLabel id="resetTypeLabel">Reset Type</InputLabel>
              <Controller
                control={control}
                name="resetType"
                render={({ field: { name, onChange, value } }) => (
                  <Select
                    id="resetType"
                    selectSize="M"
                    aria-labelledby="resetTypeLabel"
                    minWidth="100%"
                    name={name}
                    onChange={onChange}
                    value={value}
                    options={Object.values(ConsumerGroupOffsetsResetType).map(
                      (type) => ({ value: type, label: type })
                    )}
                  />
                )}
              />
            </div>
            <div>
              <InputLabel>Partitions</InputLabel>
              <MultiSelect
                options={
                  consumerGroup.partitions
                    ?.filter((p) => p.topic === topicValue)
                    .map((p) => ({
                      label: `Partition #${p.partition.toString()}`,
                      value: p.partition,
                    })) || []
                }
                value={selectedPartitions}
                onChange={onSelectedPartitionsChange}
                labelledBy="Select partitions"
              />
            </div>
          </S.MainSelectors>
          {resetTypeValue === ConsumerGroupOffsetsResetType.TIMESTAMP &&
            selectedPartitions.length > 0 && (
              <div>
                <InputLabel>Timestamp</InputLabel>
                <Controller
                  control={control}
                  name="resetToTimestamp"
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <DatePicker
                      ref={ref}
                      selected={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      showTimeInput
                      timeInputLabel="Time:"
                      dateFormat="MMMM d, yyyy h:mm aa"
                    />
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name="resetToTimestamp"
                  render={({ message }) => <FormError>{message}</FormError>}
                />
              </div>
            )}
          {resetTypeValue === ConsumerGroupOffsetsResetType.OFFSET &&
            selectedPartitions.length > 0 && (
              <div>
                <S.OffsetsTitle>Offsets</S.OffsetsTitle>
                <S.OffsetsWrapper>
                  {fields.map((field, index) => (
                    <div key={field.id}>
                      <InputLabel htmlFor={`partitionsOffsets.${index}.offset`}>
                        Partition #{field.partition}
                      </InputLabel>
                      <Input
                        id={`partitionsOffsets.${index}.offset`}
                        type="number"
                        name={`partitionsOffsets.${index}.offset` as const}
                        hookFormOptions={{
                          shouldUnregister: true,
                          min: {
                            value: 0,
                            message: 'must be greater than or equal to 0',
                          },
                        }}
                        defaultValue={field.offset}
                      />
                      <ErrorMessage
                        errors={errors}
                        name={`partitionsOffsets.${index}.offset`}
                        render={({ message }) => (
                          <FormError>{message}</FormError>
                        )}
                      />
                    </div>
                  ))}
                </S.OffsetsWrapper>
              </div>
            )}
          <Button
            buttonSize="M"
            buttonType="primary"
            type="submit"
            disabled={!isValid || selectedPartitions.length === 0}
          >
            Submit
          </Button>
        </form>
      </S.Wrapper>
    </FormProvider>
  );
};

export default ResetOffsets;
