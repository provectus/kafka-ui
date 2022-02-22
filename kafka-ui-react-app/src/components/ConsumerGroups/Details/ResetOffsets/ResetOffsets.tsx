import { ConsumerGroupOffsetsResetType } from 'generated-sources';
import { clusterConsumerGroupDetailsPath } from 'lib/paths';
import React from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { ClusterName, ConsumerGroupID } from 'redux/interfaces';
import MultiSelect from 'react-multi-select-component';
import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { groupBy } from 'lodash';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { ErrorMessage } from '@hookform/error-message';
import { useHistory, useParams } from 'react-router';
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
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';

import {
  MainSelectorsWrapperStyled,
  OffsetsWrapperStyled,
  ResetOffsetsStyledWrapper,
  OffsetsTitleStyled,
} from './ResetOffsets.styled';

interface FormType {
  topic: string;
  resetType: ConsumerGroupOffsetsResetType;
  partitionsOffsets: { offset: string | undefined; partition: number }[];
  resetToTimestamp: Date;
}

const ResetOffsets: React.FC = () => {
  const dispatch = useAppDispatch();
  const { consumerGroupID, clusterName } =
    useParams<{ consumerGroupID: ConsumerGroupID; clusterName: ClusterName }>();
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

  const history = useHistory();
  React.useEffect(() => {
    if (isOffsetReseted) {
      dispatch(resetLoaderById('consumerGroups/resetConsumerGroupOffsets'));
      history.push(
        clusterConsumerGroupDetailsPath(clusterName, consumerGroupID)
      );
    }
  }, [clusterName, consumerGroupID, dispatch, history, isOffsetReseted]);

  if (!isFetched || !consumerGroup) {
    return <PageLoader />;
  }

  return (
    <FormProvider {...methods}>
      <PageHeading text="Reset offsets" />
      <ResetOffsetsStyledWrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <MainSelectorsWrapperStyled>
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
          </MainSelectorsWrapperStyled>
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
                      className="date-picker"
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
                <OffsetsTitleStyled>Offsets</OffsetsTitleStyled>
                <OffsetsWrapperStyled>
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
                </OffsetsWrapperStyled>
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
      </ResetOffsetsStyledWrapper>
    </FormProvider>
  );
};

export default ResetOffsets;
