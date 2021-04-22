import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TOPIC_NAME_VALIDATION_PATTERN, BYTES_IN_GB } from 'lib/constants';
import { TopicName, TopicConfigByName } from 'redux/interfaces';
import { ErrorMessage } from '@hookform/error-message';

import CustomParamsContainer from './CustomParams/CustomParamsContainer';
import TimeToRetain from './TimeToRetain';

interface Props {
  topicName?: TopicName;
  config?: TopicConfigByName;
  isEditing?: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.BaseSyntheticEvent) => Promise<void>;
}

const TopicForm: React.FC<Props> = ({
  topicName,
  config,
  isEditing,
  isSubmitting,
  onSubmit,
}) => {
  const { register, errors } = useFormContext();

  return (
    <form onSubmit={onSubmit}>
      <div className="columns">
        <div className="column is-three-quarters">
          <label className="label">Topic Name *</label>
          <input
            className="input"
            placeholder="Topic Name"
            ref={register({
              required: 'Topic Name is required.',
              pattern: {
                value: TOPIC_NAME_VALIDATION_PATTERN,
                message: 'Only alphanumeric, _, -, and . allowed',
              },
            })}
            defaultValue={topicName}
            name="name"
            autoComplete="off"
            disabled={isEditing || isSubmitting}
          />
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="name" />
          </p>
        </div>

        <div className="column">
          <label className="label">Number of partitions *</label>
          <input
            className="input"
            type="number"
            placeholder="Number of partitions"
            defaultValue="1"
            ref={register({ required: 'Number of partitions is required.' })}
            name="partitions"
            disabled={isEditing || isSubmitting}
          />
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="partitions" />
          </p>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <label className="label">Replication Factor *</label>
          <input
            className="input"
            type="number"
            placeholder="Replication Factor"
            defaultValue="1"
            ref={register({ required: 'Replication Factor is required.' })}
            name="replicationFactor"
            disabled={isEditing || isSubmitting}
          />
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="replicationFactor" />
          </p>
        </div>

        <div className="column">
          <label className="label">Min In Sync Replicas *</label>
          <input
            className="input"
            type="number"
            placeholder="Min In Sync Replicas"
            defaultValue="1"
            ref={register({ required: 'Min In Sync Replicas is required.' })}
            name="minInSyncReplicas"
            disabled={isSubmitting}
          />
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="minInSyncReplicas" />
          </p>
        </div>
      </div>

      <div className="columns">
        <div className="column is-one-third">
          <label className="label">Cleanup policy</label>
          <div className="select is-block">
            <select
              defaultValue="delete"
              name="cleanupPolicy"
              ref={register}
              disabled={isSubmitting}
            >
              <option value="delete">Delete</option>
              <option value="compact">Compact</option>
            </select>
          </div>
        </div>

        <div className="column is-one-third">
          <TimeToRetain isSubmitting={isSubmitting} />
        </div>

        <div className="column is-one-third">
          <label className="label">Max size on disk in GB</label>
          <div className="select is-block">
            <select
              defaultValue={-1}
              name="retentionBytes"
              ref={register}
              disabled={isSubmitting}
            >
              <option value={-1}>Not Set</option>
              <option value={BYTES_IN_GB}>1 GB</option>
              <option value={BYTES_IN_GB * 10}>10 GB</option>
              <option value={BYTES_IN_GB * 20}>20 GB</option>
              <option value={BYTES_IN_GB * 50}>50 GB</option>
            </select>
          </div>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <label className="label">Maximum message size in bytes *</label>
          <input
            className="input"
            type="number"
            defaultValue="1000012"
            ref={register({
              required: 'Maximum message size in bytes is required',
            })}
            name="maxMessageBytes"
            disabled={isSubmitting}
          />
          <p className="help is-danger">
            <ErrorMessage errors={errors} name="maxMessageBytes" />
          </p>
        </div>
      </div>

      <CustomParamsContainer isSubmitting={isSubmitting} config={config} />

      <input
        type="submit"
        className="button is-primary"
        disabled={isSubmitting}
      />
    </form>
  );
};

export default TopicForm;
