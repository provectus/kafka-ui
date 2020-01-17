import React from 'react';
import { ClusterId, CleanupPolicy, TopicFormData } from 'types';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { clusterTopicsPath } from 'lib/paths';
import { useForm, ErrorMessage } from 'react-hook-form';
import {
  TOPIC_NAME_VALIDATION_PATTERN,
  MILLISECONDS_IN_DAY,
  BYTES_IN_GB,
} from 'lib/constants';

interface Props {
  clusterId: ClusterId;
}

const New: React.FC<Props> = ({
  clusterId,
}) => {
  const { register, handleSubmit, errors } = useForm<TopicFormData>(); // initialise the hook

  const onSubmit = (data: TopicFormData) => {
    console.log(data);
  };

  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Breadcrumb links={[
            { href: clusterTopicsPath(clusterId), label: 'All Topics' },
          ]}>
            New Topic
          </Breadcrumb>
        </div>
      </div>

      <div className="box">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="columns">

            <div className="column is-three-quarters">
              <label className="label">
                Topic Name *
              </label>
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
                name="name"
                autoComplete="off"
              />
              <p className="help is-danger">
                <ErrorMessage errors={errors} name="name" />
              </p>
            </div>

            <div className="column">
              <label className="label">
                Number of partitions *
              </label>
              <input
                className="input"
                type="number"
                placeholder="Number of partitions"
                defaultValue="1"
                ref={register({ required: 'Number of partitions is required.' })}
                name="partitions"
              />
              <p className="help is-danger">
                <ErrorMessage errors={errors} name="partitions" />
              </p>
            </div>
          </div>

          <div className="columns">
            <div className="column">
              <label className="label">
                Replication Factor *
              </label>
              <input
                className="input"
                type="number"
                placeholder="Replication Factor"
                defaultValue="1"
                ref={register({ required: 'Replication Factor is required.' })}
                name="replicationFactor"
              />
              <p className="help is-danger">
                <ErrorMessage errors={errors} name="replicationFactor" />
              </p>
            </div>

            <div className="column">
              <label className="label">
                Min In Sync Replicas *
              </label>
              <input
                className="input"
                type="number"
                placeholder="Replication Factor"
                defaultValue="1"
                ref={register({ required: 'Min In Sync Replicas is required.' })}
                name="minInSyncReplicas"
              />
              <p className="help is-danger">
                <ErrorMessage errors={errors} name="minInSyncReplicas" />
              </p>
            </div>
          </div>

          <div className="columns">
            <div className="column is-one-third">
              <label className="label">
                Cleanup policy
              </label>
              <div className="select is-block">
                <select defaultValue={CleanupPolicy.Delete} name="cleanupPolicy">
                  <option value={CleanupPolicy.Delete}>
                    Delete
                  </option>
                  <option value={CleanupPolicy.Compact}>
                    Compact
                  </option>
                </select>
              </div>
            </div>

            <div className="column is-one-third">
              <label className="label">
                Time to retain data
              </label>
              <div className="select is-block">
                <select
                  defaultValue={MILLISECONDS_IN_DAY * 7}
                  name="retentionMs"
                  ref={register}
                >
                  <option value={MILLISECONDS_IN_DAY / 2 }>
                    12 hours
                  </option>
                  <option value={MILLISECONDS_IN_DAY}>
                    1 day
                  </option>
                  <option value={MILLISECONDS_IN_DAY * 2}>
                    2 days
                  </option>
                  <option value={MILLISECONDS_IN_DAY * 7}>
                    1 week
                  </option>
                  <option value={MILLISECONDS_IN_DAY * 7 * 4}>
                    4 weeks
                  </option>
                </select>
              </div>
            </div>

            <div className="column is-one-third">
              <label className="label">
                Max size on disk in GB
              </label>
              <div className="select is-block">
                <select
                  defaultValue={-1}
                  name="retentionBytes"
                  ref={register}
                >
                  <option value={-1}>
                    Not Set
                  </option>
                  <option value={BYTES_IN_GB}>
                    1 GB
                  </option>
                  <option value={BYTES_IN_GB * 10}>
                    10 GB
                  </option>
                  <option value={BYTES_IN_GB * 20}>
                    20 GB
                  </option>
                  <option value={BYTES_IN_GB * 50}>
                    50 GB
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="columns">
            <div className="column">
              <label className="label">
                Maximum message size in bytes *
              </label>
              <input
                className="input"
                type="number"
                defaultValue="1000012"
                ref={register({ required: 'Maximum message size in bytes is required' })}
                name="maxMessageBytes"
              />
              <p className="help is-danger">
                <ErrorMessage errors={errors} name="maxMessageBytes" />
              </p>
            </div>
          </div>

          <input type="submit" className="button is-primary"/>
        </form>
      </div>
    </div>
  );
}

export default New;
