import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { NOT_SET, BYTES_IN_GB } from 'lib/constants';
import { ClusterName, TopicName } from 'redux/interfaces';
import { ErrorMessage } from '@hookform/error-message';
import Select, { SelectOption } from 'components/common/Select/Select';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { FormError } from 'components/common/Input/Input.styled';
import { StyledForm } from 'components/common/Form/Form.styled';
import { clusterTopicPath } from 'lib/paths';
import { useNavigate } from 'react-router-dom';
import useAppParams from 'lib/hooks/useAppParams';

import CustomParams from './CustomParams/CustomParams';
import TimeToRetain from './TimeToRetain';
import * as S from './TopicForm.styled';

export interface Props {
  topicName?: TopicName;
  partitionCount?: number;
  replicationFactor?: number;
  inSyncReplicas?: number;
  retentionBytes?: number;
  cleanUpPolicy?: string;
  isEditing?: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.BaseSyntheticEvent) => Promise<void>;
}

const CleanupPolicyOptions: Array<SelectOption> = [
  { value: 'delete', label: 'Delete' },
  { value: 'compact', label: 'Compact' },
  { value: 'compact,delete', label: 'Compact,Delete' },
];

const RetentionBytesOptions: Array<SelectOption> = [
  { value: NOT_SET, label: 'Not Set' },
  { value: BYTES_IN_GB, label: '1 GB' },
  { value: BYTES_IN_GB * 10, label: '10 GB' },
  { value: BYTES_IN_GB * 20, label: '20 GB' },
  { value: BYTES_IN_GB * 50, label: '50 GB' },
];

const TopicForm: React.FC<Props> = ({
  retentionBytes,
  topicName,
  isEditing,
  isSubmitting,
  onSubmit,
  partitionCount,
  replicationFactor,
  inSyncReplicas,
  cleanUpPolicy,
}) => {
  const {
    control,
    formState: { errors, isDirty, isValid },
    reset,
  } = useFormContext();
  const navigate = useNavigate();
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const getCleanUpPolicy =
    CleanupPolicyOptions.find((option: SelectOption) => {
      return (
        option.value.toString().replace(/,/g, '_') ===
        cleanUpPolicy?.toLowerCase()
      );
    })?.value || CleanupPolicyOptions[0].value;

  const getRetentionBytes =
    RetentionBytesOptions.find((option: SelectOption) => {
      return option.value === retentionBytes;
    })?.value || RetentionBytesOptions[0].value;

  const onCancel = () => {
    reset();
    navigate(clusterTopicPath(clusterName, topicName));
  };

  return (
    <StyledForm onSubmit={onSubmit} aria-label="topic form">
      <fieldset disabled={isSubmitting}>
        <fieldset disabled={isEditing}>
          <S.Column>
            <S.NameField>
              <InputLabel htmlFor="topicFormName">Topic Name *</InputLabel>
              <Input
                id="topicFormName"
                name="name"
                placeholder="Topic Name"
                defaultValue={topicName}
              />
              <FormError>
                <ErrorMessage errors={errors} name="name" />
              </FormError>
            </S.NameField>
          </S.Column>

          {!isEditing && (
            <S.Column>
              <div>
                <InputLabel htmlFor="topicFormNumberOfPartitions">
                  Number of partitions *
                </InputLabel>
                <Input
                  id="topicFormNumberOfPartitions"
                  type="number"
                  placeholder="Number of partitions"
                  min="1"
                  defaultValue={partitionCount}
                  name="partitions"
                />
                <FormError>
                  <ErrorMessage errors={errors} name="partitions" />
                </FormError>
              </div>
              <div>
                <InputLabel htmlFor="topicFormReplicationFactor">
                  Replication Factor *
                </InputLabel>
                <Input
                  id="topicFormReplicationFactor"
                  type="number"
                  placeholder="Replication Factor"
                  min="1"
                  defaultValue={replicationFactor}
                  name="replicationFactor"
                />
                <FormError>
                  <ErrorMessage errors={errors} name="replicationFactor" />
                </FormError>
              </div>
            </S.Column>
          )}
        </fieldset>

        <S.Column>
          <div>
            <InputLabel htmlFor="topicFormMinInSyncReplicas">
              Min In Sync Replicas *
            </InputLabel>
            <Input
              id="topicFormMinInSyncReplicas"
              type="number"
              placeholder="Min In Sync Replicas"
              min="1"
              defaultValue={inSyncReplicas}
              name="minInSyncReplicas"
            />
            <FormError>
              <ErrorMessage errors={errors} name="minInSyncReplicas" />
            </FormError>
          </div>
          <div>
            <InputLabel
              id="topicFormCleanupPolicyLabel"
              htmlFor="topicFormCleanupPolicy"
            >
              Cleanup policy
            </InputLabel>
            <Controller
              defaultValue={CleanupPolicyOptions[0].value}
              control={control}
              name="cleanupPolicy"
              render={({ field: { name, onChange } }) => (
                <Select
                  id="topicFormCleanupPolicy"
                  aria-labelledby="topicFormCleanupPolicyLabel"
                  name={name}
                  value={getCleanUpPolicy}
                  onChange={onChange}
                  minWidth="250px"
                  options={CleanupPolicyOptions}
                />
              )}
            />
          </div>
        </S.Column>

        <S.Column>
          <div>
            <TimeToRetain isSubmitting={isSubmitting} />
          </div>
        </S.Column>

        <S.Column>
          <div>
            <InputLabel
              id="topicFormRetentionBytesLabel"
              htmlFor="topicFormRetentionBytes"
            >
              Max size on disk in GB
            </InputLabel>
            <Controller
              control={control}
              name="retentionBytes"
              defaultValue={RetentionBytesOptions[0].value}
              render={({ field: { name, onChange } }) => (
                <Select
                  id="topicFormRetentionBytes"
                  aria-labelledby="topicFormRetentionBytesLabel"
                  name={name}
                  value={getRetentionBytes}
                  onChange={onChange}
                  minWidth="100%"
                  options={RetentionBytesOptions}
                />
              )}
            />
          </div>

          <div>
            <InputLabel htmlFor="topicFormMaxMessageBytes">
              Maximum message size in bytes *
            </InputLabel>
            <Input
              id="topicFormMaxMessageBytes"
              type="number"
              min="1"
              defaultValue="1000012"
              name="maxMessageBytes"
            />
            <FormError>
              <ErrorMessage errors={errors} name="maxMessageBytes" />
            </FormError>
          </div>
        </S.Column>

        <S.CustomParamsHeading>Custom parameters</S.CustomParamsHeading>
        <CustomParams isSubmitting={isSubmitting} />
        <S.ButtonWrapper>
          <Button
            type="button"
            buttonType="primary"
            buttonSize="L"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            buttonType="primary"
            buttonSize="L"
            disabled={!isValid || isSubmitting || !isDirty}
          >
            {isEditing ? 'Update topic' : 'Create topic'}
          </Button>
        </S.ButtonWrapper>
      </fieldset>
    </StyledForm>
  );
};

export default TopicForm;
