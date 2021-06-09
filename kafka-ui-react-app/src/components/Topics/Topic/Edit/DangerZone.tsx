import { ErrorMessage } from '@hookform/error-message';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import React from 'react';
import { useForm } from 'react-hook-form';

const DangerZone = ({
  defaultPartitions,
  defaultReplicationFactor,
}: {
  defaultPartitions: number;
  defaultReplicationFactor: number;
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

  const {
    register: partitionsRegister,
    handleSubmit: handlePartitionsSubmit,
    formState: partitionsFormState,
    setError: setPartitionsError,
  } = useForm({
    defaultValues: {
      partitions,
    },
  });

  const {
    register: replicationFactorRegister,
    handleSubmit: handleКeplicationFactorSubmit,
    formState: replicationFactorFormState,
  } = useForm({
    defaultValues: {
      replicationFactor,
    },
  });

  const validatePartitions = (data: { partitions: number }) => {
    if (data.partitions < defaultPartitions) {
      setPartitionsError('partitions', {
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

  const partitionsSubmit = () => {
    // API call here
    setIsPartitionsConfirmationVisible(false);
  };
  const replicationFactorSubmit = () => {
    // API call here
    setIsReplicationFactorConfirmationVisible(false);
  };
  return (
    <div className="box">
      <h4 className="title is-5 has-text-danger mb-5">Danger Zone</h4>
      <div className="is-flex is-flex-direction-column">
        <form
          onSubmit={handlePartitionsSubmit(validatePartitions)}
          className="columns mb-0"
        >
          <div className="column is-three-quarters">
            <label className="label">Number of partitions *</label>
            <input
              className="input"
              type="number"
              placeholder="Number of partitions"
              {...partitionsRegister('partitions', {
                required: 'Partiotions are required',
              })}
            />
          </div>
          <div className="column is-flex is-align-items-flex-end">
            <input type="submit" className="button is-danger" />
          </div>
        </form>
        <p className="help is-danger mt-0 mb-4">
          <ErrorMessage errors={partitionsFormState.errors} name="partitions" />
        </p>
        <ConfirmationModal
          isOpen={isPartitionsConfirmationVisible}
          onCancel={() => setIsPartitionsConfirmationVisible(false)}
          onConfirm={partitionsSubmit}
        >
          Are you sure you want to increase the number of partitions?
        </ConfirmationModal>

        <form
          onSubmit={handleКeplicationFactorSubmit(validateReplicationFactor)}
          className="columns"
        >
          <div className="column is-three-quarters">
            <label className="label">Replication Factor *</label>
            <input
              className="input"
              type="number"
              placeholder="Replication Factor"
              {...replicationFactorRegister('replicationFactor', {
                required: 'Replication Factor are required',
              })}
            />
          </div>
          <div className="column is-flex is-align-items-flex-end">
            <input type="submit" className="button is-danger" />
          </div>
        </form>
        <p className="help is-danger mt-0">
          <ErrorMessage
            errors={replicationFactorFormState.errors}
            name="replicationFactor"
          />
        </p>
        <ConfirmationModal
          isOpen={isReplicationFactorConfirmationVisible}
          onCancel={() => setIsReplicationFactorConfirmationVisible(false)}
          onConfirm={replicationFactorSubmit}
        >
          Are you sure you want to update the replication factor?
        </ConfirmationModal>
      </div>
    </div>
  );
};

export default DangerZone;
