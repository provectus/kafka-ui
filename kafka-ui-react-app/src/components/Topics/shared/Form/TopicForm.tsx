import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BYTES_IN_GB } from 'lib/constants';
import { TopicName, TopicConfigByName } from 'redux/interfaces';
import { ErrorMessage } from '@hookform/error-message';
import Select from 'components/common/Select/Select';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import { FormError } from 'components/common/Input/Input.styled';
import { StyledForm } from 'components/common/Form/Form.styles';

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
            <Select defaultValue="delete" name="cleanupPolicy" minWidth="250px">
              <option value="delete">Delete</option>
              <option value="compact">Compact</option>
              <option value="compact,delete">Compact,Delete</option>
            </Select>
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
              <Select defaultValue={-1} name="retentionBytes">
                <option value={-1}>Not Set</option>
                <option value={BYTES_IN_GB}>1 GB</option>
                <option value={BYTES_IN_GB * 10}>10 GB</option>
                <option value={BYTES_IN_GB * 20}>20 GB</option>
                <option value={BYTES_IN_GB * 50}>50 GB</option>
              </Select>
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
