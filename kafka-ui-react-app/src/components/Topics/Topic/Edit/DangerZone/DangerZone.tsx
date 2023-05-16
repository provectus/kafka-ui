import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { useConfirm } from 'lib/hooks/useConfirm';
import {
  useIncreaseTopicPartitionsCount,
  useUpdateTopicReplicationFactor,
} from 'lib/hooks/api/topics';

import * as S from './DangerZone.styled';

export interface DangerZoneProps {
  defaultPartitions: number;
  defaultReplicationFactor: number;
}

const DangerZone: React.FC<DangerZoneProps> = ({
  defaultPartitions,
  defaultReplicationFactor,
}) => {
  const params = useAppParams<RouteParamsClusterTopic>();
  const [partitions, setPartitions] = React.useState<number>(defaultPartitions);
  const [replicationFactor, setReplicationFactor] = React.useState<number>(
    defaultReplicationFactor
  );
  const increaseTopicPartitionsCount = useIncreaseTopicPartitionsCount(params);
  const updateTopicReplicationFactor = useUpdateTopicReplicationFactor(params);

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
        increaseTopicPartitionsCount.mutateAsync(
          partitionsMethods.getValues('partitions')
        )
    );
  const confirmReplicationFactorChange = () =>
    confirm('Are you sure you want to update the replication factor?', () =>
      updateTopicReplicationFactor.mutateAsync(
        replicationFactorMethods.getValues('replicationFactor')
      )
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
    try {
      setReplicationFactor(data.replicationFactor);
      confirmReplicationFactorChange();
    } catch (e) {
      // do nothing
    }
  };

  return (
    <S.Wrapper>
      <S.Title>Danger Zone</S.Title>
      <S.Warning>
        Change these parameters only if you are absolutely sure what you are
        doing.
      </S.Warning>
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
