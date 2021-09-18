import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import {
  ConsumerGroupDetails,
  ConsumerGroupOffsetsResetType,
} from 'generated-sources';
import {
  clusterConsumerGroupsPath,
  clusterConsumerGroupDetailsPath,
} from 'lib/paths';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { ClusterName, ConsumerGroupID } from 'redux/interfaces';
import MultiSelect from 'react-multi-select-component';
import { Option } from 'react-multi-select-component/dist/lib/interfaces';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { groupBy } from 'lodash';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { ErrorMessage } from '@hookform/error-message';
import { useHistory } from 'react-router';

export interface Props {
  clusterName: ClusterName;
  consumerGroupID: ConsumerGroupID;
  consumerGroup: ConsumerGroupDetails;
  detailsAreFetched: boolean;
  IsOffsetReset: boolean;
  fetchConsumerGroupDetails(
    clusterName: ClusterName,
    consumerGroupID: ConsumerGroupID
  ): void;
  resetConsumerGroupOffsets(
    clusterName: ClusterName,
    consumerGroupID: ConsumerGroupID,
    requestBody: {
      topic: string;
      resetType: ConsumerGroupOffsetsResetType;
      partitionsOffsets?: { offset: string; partition: number }[];
      resetToTimestamp?: Date;
      partitions: number[];
    }
  ): void;
  resetResettingStatus: () => void;
}

interface FormType {
  topic: string;
  resetType: ConsumerGroupOffsetsResetType;
  partitionsOffsets: { offset: string | undefined; partition: number }[];
  resetToTimestamp: Date;
}

const ResetOffsets: React.FC<Props> = ({
  clusterName,
  consumerGroupID,
  consumerGroup,
  detailsAreFetched,
  IsOffsetReset,
  fetchConsumerGroupDetails,
  resetConsumerGroupOffsets,
  resetResettingStatus,
}) => {
  React.useEffect(() => {
    fetchConsumerGroupDetails(clusterName, consumerGroupID);
  }, [clusterName, consumerGroupID]);

  const [uniqueTopics, setUniqueTopics] = React.useState<string[]>([]);
  const [selectedPartitions, setSelectedPartitions] = React.useState<Option[]>(
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormType>({
    defaultValues: {
      resetType: ConsumerGroupOffsetsResetType.EARLIEST,
      topic: '',
      partitionsOffsets: [],
    },
  });
  const { fields } = useFieldArray({
    control,
    name: 'partitionsOffsets',
  });
  const resetTypeValue = watch('resetType');
  const topicValue = watch('topic');
  const offsetsValue = watch('partitionsOffsets');

  React.useEffect(() => {
    if (detailsAreFetched && consumerGroup.partitions) {
      setValue('topic', consumerGroup.partitions[0].topic);
      setUniqueTopics(Object.keys(groupBy(consumerGroup.partitions, 'topic')));
    }
  }, [detailsAreFetched]);

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
    let isValid = true;
    if (augmentedData.resetType === ConsumerGroupOffsetsResetType.OFFSET) {
      augmentedData.partitionsOffsets.forEach((offset, index) => {
        if (!offset.offset) {
          setError(`partitionsOffsets.${index}.offset`, {
            type: 'manual',
            message: "This field shouldn't be empty!",
          });
          isValid = false;
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
        isValid = false;
      }
    }
    if (isValid) {
      resetConsumerGroupOffsets(clusterName, consumerGroupID, augmentedData);
    }
  };

  const history = useHistory();
  React.useEffect(() => {
    if (IsOffsetReset) {
      resetResettingStatus();
      history.push(
        clusterConsumerGroupDetailsPath(clusterName, consumerGroupID)
      );
    }
  }, [IsOffsetReset]);

  if (!detailsAreFetched) {
    return <PageLoader />;
  }

  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Breadcrumb
            links={[
              {
                href: clusterConsumerGroupsPath(clusterName),
                label: 'All Consumer Groups',
              },
              {
                href: clusterConsumerGroupDetailsPath(
                  clusterName,
                  consumerGroupID
                ),
                label: consumerGroupID,
              },
            ]}
          >
            Reset Offsets
          </Breadcrumb>
        </div>
      </div>

      <div className="box">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="columns">
            <div className="column is-one-third">
              <label className="label" htmlFor="topic">
                Topic
              </label>
              <div className="select">
                <select {...register('topic')} id="topic">
                  {uniqueTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="column is-one-third">
              <label className="label" htmlFor="resetType">
                Reset Type
              </label>
              <div className="select">
                <select {...register('resetType')} id="resetType">
                  {Object.values(ConsumerGroupOffsetsResetType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="column is-one-third">
              <label className="label">Partitions</label>
              <div className="select">
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
            </div>
          </div>
          {resetTypeValue === ConsumerGroupOffsetsResetType.TIMESTAMP &&
            selectedPartitions.length > 0 && (
              <div className="columns">
                <div className="column is-half">
                  <label className="label">Timestamp</label>
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
                        className="input"
                      />
                    )}
                  />
                  <ErrorMessage
                    errors={errors}
                    name="resetToTimestamp"
                    render={({ message }) => (
                      <p className="help is-danger">{message}</p>
                    )}
                  />
                </div>
              </div>
            )}
          {resetTypeValue === ConsumerGroupOffsetsResetType.OFFSET &&
            selectedPartitions.length > 0 && (
              <div className="columns">
                <div className="column is-one-third">
                  <label className="label">Offsets</label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="mb-2">
                      <label
                        className="subtitle is-6"
                        htmlFor={`partitionsOffsets.${index}.offset`}
                      >
                        Partition #{field.partition}
                      </label>
                      <input
                        id={`partitionsOffsets.${index}.offset`}
                        type="number"
                        className="input"
                        {...register(
                          `partitionsOffsets.${index}.offset` as const,
                          { shouldUnregister: true }
                        )}
                        defaultValue={field.offset}
                      />
                      <ErrorMessage
                        errors={errors}
                        name={`partitionsOffsets.${index}.offset`}
                        render={({ message }) => (
                          <p className="help is-danger">{message}</p>
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          <button
            className="button is-primary"
            type="submit"
            disabled={selectedPartitions.length === 0}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetOffsets;
