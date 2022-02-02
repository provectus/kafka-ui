import { ErrorMessage } from '@hookform/error-message';
import { Button } from 'components/common/Button/Button';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import * as S from './DangerZone.styled';

export interface Props {
  clusterName: string;
  topicName: string;
  defaultPartitions: number;
  defaultReplicationFactor: number;
  partitionsCountIncreased: boolean;
  replicationFactorUpdated: boolean;
  updateTopicPartitionsCount: (
    clusterName: string,
    topicname: string,
    partitions: number
  ) => void;
  updateTopicReplicationFactor: (
    clusterName: string,
    topicname: string,
    replicationFactor: number
  ) => void;
}

const DangerZone: React.FC<Props> = ({
  clusterName,
  topicName,
  defaultPartitions,
  defaultReplicationFactor,
  partitionsCountIncreased,
  replicationFactorUpdated,
  updateTopicPartitionsCount,
  updateTopicReplicationFactor,
}) => {
  const [isPartitionsConfirmationVisible, setIsPartitionsConfirmationVisible] =
    React.useState<boolean>(false);
  const [
    isReplicationFactorConfirmationVisible,
    setIsReplicationFactorConfirmationVisible,
  ] = React.useState<boolean>(false);
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

  const validatePartitions = (data: { partitions: number }) => {
    if (data.partitions < defaultPartitions) {
      partitionsMethods.setError('partitions', {
        type: 'manual',
        message: 'You can only increase the number of partitions!',
      });
    } else {
      setPartitions(data.partitions);
      setIsPartitionsConfirmationVisible(true);
    }
  };

  const validateReplicationFactor = (data: { replicationFactor: number }) => {
    setReplicationFactor(data.replicationFactor);
    setIsReplicationFactorConfirmationVisible(true);
  };

  React.useEffect(() => {
    if (partitionsCountIncreased) {
      setIsPartitionsConfirmationVisible(false);
    }
  }, [partitionsCountIncreased]);

  React.useEffect(() => {
    if (replicationFactorUpdated) {
      setIsReplicationFactorConfirmationVisible(false);
    }
  }, [replicationFactorUpdated]);

  const partitionsSubmit = () => {
    updateTopicPartitionsCount(
      clusterName,
      topicName,
      partitionsMethods.getValues('partitions')
    );
  };
  const replicationFactorSubmit = () => {
    updateTopicReplicationFactor(
      clusterName,
      topicName,
      replicationFactorMethods.getValues('replicationFactor')
    );
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
        <ConfirmationModal
          isOpen={isPartitionsConfirmationVisible}
          onCancel={() => setIsPartitionsConfirmationVisible(false)}
          onConfirm={partitionsSubmit}
        >
          Are you sure you want to increase the number of partitions? Do it only
          if you 100% know what you are doing!
        </ConfirmationModal>

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
        <ConfirmationModal
          isOpen={isReplicationFactorConfirmationVisible}
          onCancel={() => setIsReplicationFactorConfirmationVisible(false)}
          onConfirm={replicationFactorSubmit}
        >
          Are you sure you want to update the replication factor?
        </ConfirmationModal>
      </div>
    </S.Wrapper>
  );
};

export default DangerZone;
