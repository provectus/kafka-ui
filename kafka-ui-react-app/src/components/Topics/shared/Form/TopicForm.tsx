import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BYTES_IN_GB } from 'lib/constants';
import { TopicName, TopicConfigByName } from 'redux/interfaces';
import { ErrorMessage } from '@hookform/error-message';
import Select from 'components/common/Select/Select';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import styled from 'styled-components';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { FormError } from 'components/common/Input/Input.styled';
import { StyledForm } from 'components/common/Form/Form.styles';

import CustomParamsContainer from './CustomParams/CustomParamsContainer';
import TimeToRetain from './TimeToRetain';

interface Props {
  topicName?: TopicName;
  config?: TopicConfigByName;
  isEditing?: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.BaseSyntheticEvent) => Promise<void>;
}

export const TopicFormColumn = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  & > * {
    flex-grow: 1;
  }
`;

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
    <StyledForm onSubmit={onSubmit}>
      <fieldset disabled={isSubmitting}>
        <fieldset disabled={isEditing}>
          <TopicFormColumn>
            <div>
              <InputLabel>Topic Name *</InputLabel>
              <Input
                name="name"
                placeholder="Topic Name"
                defaultValue={topicName}
                inputSize="M"
              />
              <FormError>
                <ErrorMessage errors={errors} name="name" />
              </FormError>
            </div>
          </TopicFormColumn>

          {!isEditing && (
            <TopicFormColumn>
              <div>
                <InputLabel>Number of partitions *</InputLabel>
                <Input
                  type="number"
                  placeholder="Number of partitions"
                  defaultValue="1"
                  name="partitions"
                  inputSize="M"
                />
                <FormError>
                  <ErrorMessage errors={errors} name="partitions" />
                </FormError>
              </div>
            </TopicFormColumn>
          )}
        </fieldset>

        <TopicFormColumn>
          {!isEditing && (
            <div>
              <InputLabel>Replication Factor *</InputLabel>
              <Input
                type="number"
                placeholder="Replication Factor"
                defaultValue="1"
                name="replicationFactor"
                inputSize="M"
              />
              <FormError>
                <ErrorMessage errors={errors} name="replicationFactor" />
              </FormError>
            </div>
          )}

          <div>
            <InputLabel>Min In Sync Replicas *</InputLabel>
            <Input
              type="number"
              placeholder="Min In Sync Replicas"
              defaultValue="1"
              name="minInsyncReplicas"
              inputSize="M"
            />
            <FormError>
              <ErrorMessage errors={errors} name="minInsyncReplicas" />
            </FormError>
          </div>
        </TopicFormColumn>

        <div>
          <TopicFormColumn>
            <div>
              <InputLabel>Cleanup policy</InputLabel>
              <Select defaultValue="delete" name="cleanupPolicy" selectSize="M">
                <option value="delete">Delete</option>
                <option value="compact">Compact</option>
                <option value="compact,delete">Compact,Delete</option>
              </Select>
            </div>
          </TopicFormColumn>

          <TopicFormColumn>
            <div>
              <TimeToRetain isSubmitting={isSubmitting} />
            </div>
          </TopicFormColumn>
          <TopicFormColumn>
            <div>
              <InputLabel>Max size on disk in GB</InputLabel>
              <Select defaultValue={-1} name="retentionBytes" selectSize="M">
                <option value={-1}>Not Set</option>
                <option value={BYTES_IN_GB}>1 GB</option>
                <option value={BYTES_IN_GB * 10}>10 GB</option>
                <option value={BYTES_IN_GB * 20}>20 GB</option>
                <option value={BYTES_IN_GB * 50}>50 GB</option>
              </Select>
            </div>
          </TopicFormColumn>
        </div>

        <div>
          <InputLabel>Maximum message size in bytes *</InputLabel>
          <Input
            type="number"
            defaultValue="1000012"
            name="maxMessageBytes"
            inputSize="M"
          />
          <FormError>
            <ErrorMessage errors={errors} name="maxMessageBytes" />
          </FormError>
        </div>

        <CustomParamsContainer isSubmitting={isSubmitting} config={config} />

        <Button type="submit" buttonType="primary" buttonSize="L">
          Send
        </Button>
      </fieldset>
    </StyledForm>
  );
};

export default TopicForm;
