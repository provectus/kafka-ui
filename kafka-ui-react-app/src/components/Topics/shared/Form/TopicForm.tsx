import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { BYTES_IN_GB } from 'lib/constants';
import { TopicName, TopicConfigByName } from 'redux/interfaces';
import { ErrorMessage } from '@hookform/error-message';
import Select, { SelectOption } from 'components/common/Select/Select';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { FormError } from 'components/common/Input/Input.styled';
import { StyledForm } from 'components/common/Form/Form.styled';

import CustomParamsContainer from './CustomParams/CustomParamsContainer';
import TimeToRetain from './TimeToRetain';
import * as S from './TopicForm.styled';

interface Props {
  topicName?: TopicName;
  config?: TopicConfigByName;
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
  { value: -1, label: 'Not Set' },
  { value: BYTES_IN_GB, label: '1 GB' },
  { value: BYTES_IN_GB * 10, label: '10 GB' },
  { value: BYTES_IN_GB * 20, label: '20 GB' },
  { value: BYTES_IN_GB * 50, label: '50 GB' },
];

const TopicForm: React.FC<Props> = ({
  topicName,
  config,
  isEditing,
  isSubmitting,
  onSubmit,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <StyledForm onSubmit={onSubmit}>
      <fieldset disabled={isSubmitting}>
        <fieldset disabled={isEditing}>
          <S.Column>
            <S.NameField>
              <InputLabel>Topic Name *</InputLabel>
              <Input
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
                <InputLabel>Number of partitions *</InputLabel>
                <Input
                  type="number"
                  placeholder="Number of partitions"
                  min="1"
                  defaultValue="1"
                  name="partitions"
                />
                <FormError>
                  <ErrorMessage errors={errors} name="partitions" />
                </FormError>
              </div>
              <div>
                <InputLabel>Replication Factor *</InputLabel>
                <Input
                  type="number"
                  placeholder="Replication Factor"
                  min="1"
                  defaultValue="1"
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
            <InputLabel>Min In Sync Replicas *</InputLabel>
            <Input
              type="number"
              placeholder="Min In Sync Replicas"
              min="1"
              defaultValue="1"
              name="minInsyncReplicas"
            />
            <FormError>
              <ErrorMessage errors={errors} name="minInsyncReplicas" />
            </FormError>
          </div>
          <div>
            <InputLabel>Cleanup policy</InputLabel>
            <Controller
              control={control}
              name="cleanupPolicy"
              render={({ field: { name, onChange } }) => (
                <Select
                  name={name}
                  value={CleanupPolicyOptions[0].value}
                  onChange={onChange}
                  minWidth="250px"
                  options={CleanupPolicyOptions}
                />
              )}
            />
          </div>
        </S.Column>

        <div>
          <S.Column>
            <div>
              <TimeToRetain isSubmitting={isSubmitting} />
            </div>
          </S.Column>
          <S.Column>
            <div>
              <InputLabel>Max size on disk in GB</InputLabel>
              <Controller
                control={control}
                name="retentionBytes"
                render={({ field: { name, onChange } }) => (
                  <Select
                    name={name}
                    value={RetentionBytesOptions[0].value}
                    onChange={onChange}
                    minWidth="100%"
                    options={RetentionBytesOptions}
                  />
                )}
              />
            </div>

            <div>
              <InputLabel>Maximum message size in bytes *</InputLabel>
              <Input
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
        </div>

        <S.CustomParamsHeading>Custom parameters</S.CustomParamsHeading>

        <CustomParamsContainer isSubmitting={isSubmitting} config={config} />

        <Button type="submit" buttonType="primary" buttonSize="L">
          Send
        </Button>
      </fieldset>
    </StyledForm>
  );
};

export default TopicForm;
