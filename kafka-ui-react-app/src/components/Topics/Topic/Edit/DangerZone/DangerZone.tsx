import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RouteParamsClusterTopic } from 'lib/paths';
import { ClusterName, TopicName } from 'redux/interfaces';
import useAppParams from 'lib/hooks/useAppParams';
import { useConfirm } from 'lib/hooks/useConfirm';

import * as S from './DangerZone.styled';

export interface Props {
  defaultPartitions: number;
  defaultReplicationFactor: number;
  updateTopicPartitionsCount: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
    partitions: number;
  }) => void;
  updateTopicReplicationFactor: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
    replicationFactor: number;
  }) => void;
}

const DangerZone: React.FC<Props> = ({
  defaultPartitions,
  defaultReplicationFactor,
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
}) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();
  const [partitions, setPartitions] = React.useState<number>(defaultPartitions);
  const [replicationFactor, setReplicationFactor] = React.useState<number>(
    defaultReplicationFactor
  );

  const partitionsMethods = useForm({
    defaultValues: {
      partitions,
    },
  });

  const replicationFactorMethods = useForm({
    defaultValues: {
      replicationFactor,
    },
  });

  const confirm = useConfirm();

  const confirmPartitionsChange = () =>
    confirm(
      `Are you sure you want to increase the number of partitions?
        Do it only if you 100% know what you are doing!`,
      () =>
        updateTopicPartitionsCount({
          clusterName,
          topicName,
          partitions: partitionsMethods.getValues('partitions'),
        })
    );
  const confirmReplicationFactorChange = () =>
    confirm('Are you sure you want to update the replication factor?', () =>
      updateTopicReplicationFactor({
        clusterName,
        topicName,
        replicationFactor:
          replicationFactorMethods.getValues('replicationFactor'),
      })
    );

  const validatePartitions = (data: { partitions: number }) => {
    if (data.partitions < defaultPartitions) {
      partitionsMethods.setError('partitions', {
        type: 'manual',
        message: 'You can only increase the number of partitions!',
      });
    } else {
      setPartitions(data.partitions);
      confirmPartitionsChange();
    }
  };

  const validateReplicationFactor = (data: { replicationFactor: number }) => {
    setReplicationFactor(data.replicationFactor);
    confirmReplicationFactorChange();
  };

  return (
    <S.Wrapper>
      <S.Title>Danger Zone</S.Title>
      <div>
        <FormProvider {...partitionsMethods}>
          <S.Form
            onSubmit={partitionsMethods.handleSubmit(validatePartitions)}
            aria-label="Edit number of partitions"
          >
            <div>
              <InputLabel htmlFor="partitions">
                Number of partitions *
              </InputLabel>
              <Input
                inputSize="M"
                type="number"
                id="partitions"
                name="partitions"
                hookFormOptions={{
                  required: 'Partiotions are required',
                }}
                placeholder="Number of partitions"
              />
            </div>
            <div>
              <Button
                buttonType="primary"
                buttonSize="M"
                type="submit"
                disabled={!partitionsMethods.formState.isDirty}
              >
                Submit
              </Button>
            </div>
          </S.Form>
        </FormProvider>
        <FormError>
          <ErrorMessage
            errors={partitionsMethods.formState.errors}
            name="partitions"
          />
        </FormError>
        <FormProvider {...replicationFactorMethods}>
          <S.Form
            onSubmit={replicationFactorMethods.handleSubmit(
              validateReplicationFactor
            )}
            aria-label="Edit replication factor"
          >
            <div>
              <InputLabel htmlFor="replicationFactor">
                Replication Factor *
              </InputLabel>
              <Input
                id="replicationFactor"
                inputSize="M"
                type="number"
                placeholder="Replication Factor"
                name="replicationFactor"
                hookFormOptions={{
                  required: 'Replication Factor are required',
                }}
              />
            </div>
            <div>
              <Button
                buttonType="primary"
                buttonSize="M"
                type="submit"
                disabled={!replicationFactorMethods.formState.isDirty}
              >
                Submit
              </Button>
            </div>
          </S.Form>
        </FormProvider>
        <FormError>
          <ErrorMessage
            errors={replicationFactorMethods.formState.errors}
            name="replicationFactor"
          />
        </FormError>
      </div>
    </S.Wrapper>
  );
};

export default DangerZone;
