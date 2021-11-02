import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BYTES_IN_GB } from 'lib/constants';
import { TopicName, TopicConfigByName } from 'redux/interfaces';
import { ErrorMessage } from '@hookform/error-message';
import Select from 'components/common/Select/Select';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';

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
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <form onSubmit={onSubmit}>
      <fieldset disabled={isSubmitting}>
        <fieldset disabled={isEditing}>
          <div className="columns">
            <div className={`column ${isEditing ? '' : 'is-three-quarters'}`}>
              <label className="label">Topic Name *</label>
              <Input
                name="name"
                placeholder="Topic Name"
                defaultValue={topicName}
              />
              <p className="help is-danger">
                <ErrorMessage errors={errors} name="name" />
              </p>
            </div>

            {!isEditing && (
              <div className="column">
                <label className="label">Number of partitions *</label>
                <Input
                  type="number"
                  placeholder="Number of partitions"
                  defaultValue="1"
                  name="partitions"
                />
                <p className="help is-danger">
                  <ErrorMessage errors={errors} name="partitions" />
                </p>
              </div>
            )}
          </div>
        </fieldset>

        <div className="columns">
          {!isEditing && (
            <div className="column">
              <label className="label">Replication Factor *</label>
              <Input
                type="number"
                placeholder="Replication Factor"
                defaultValue="1"
                name="replicationFactor"
              />
              <p className="help is-danger">
                <ErrorMessage errors={errors} name="replicationFactor" />
              </p>
            </div>
          )}

          <div className="column">
            <label className="label">Min In Sync Replicas *</label>
            <Input
              type="number"
              placeholder="Min In Sync Replicas"
              defaultValue="1"
              name="minInsyncReplicas"
            />
            <p className="help is-danger">
              <ErrorMessage errors={errors} name="minInsyncReplicas" />
            </p>
          </div>
        </div>

        <div className="columns">
          <div className="column is-one-third">
            <label className="label">Cleanup policy</label>
            <div className="is-block">
              <Select defaultValue="delete" name="cleanupPolicy">
                <option value="delete">Delete</option>
                <option value="compact">Compact</option>
                <option value="compact,delete">Compact,Delete</option>
              </Select>
            </div>
          </div>

          <div className="column is-one-third">
            <TimeToRetain isSubmitting={isSubmitting} />
          </div>

          <div className="column is-one-third">
            <label className="label">Max size on disk in GB</label>
            <div className="is-block">
              <Select defaultValue={-1} name="retentionBytes">
                <option value={-1}>Not Set</option>
                <option value={BYTES_IN_GB}>1 GB</option>
                <option value={BYTES_IN_GB * 10}>10 GB</option>
                <option value={BYTES_IN_GB * 20}>20 GB</option>
                <option value={BYTES_IN_GB * 50}>50 GB</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="columns">
          <div className="column">
            <label className="label">Maximum message size in bytes *</label>
            <Input
              type="number"
              defaultValue="1000012"
              name="maxMessageBytes"
            />
            <p className="help is-danger">
              <ErrorMessage errors={errors} name="maxMessageBytes" />
            </p>
          </div>
        </div>

        <CustomParamsContainer isSubmitting={isSubmitting} config={config} />

        <Button type="submit" buttonType="primary" buttonSize="L">
          Send
        </Button>
      </fieldset>
    </form>
  );
};

export default TopicForm;
