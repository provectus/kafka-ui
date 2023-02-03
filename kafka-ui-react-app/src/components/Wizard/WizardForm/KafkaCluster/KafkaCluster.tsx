import React from 'react';
import Input from 'components/common/Input/Input';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormError, InputHint } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import CloseIcon from 'components/common/Icons/CloseIcon';
import { Button } from 'components/common/Button/Button';
import PlusIcon from 'components/common/Icons/PlusIcon';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import Heading from 'components/common/heading/Heading.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';

const KafkaCluster: React.FC = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bootstrapServers',
  });

  return (
    <>
      <Heading level={3}>Kafka Cluster</Heading>
      <div>
        <InputLabel htmlFor="name">Cluster Name *</InputLabel>
        <Input id="name" type="text" name="name" />
        <FormError>
          <ErrorMessage errors={errors} name="name" />
        </FormError>
        <InputHint>
          this name will help you recognize the cluster in the application
          interface
        </InputHint>
      </div>
      <div>
        <InputLabel>
          <input {...register('readOnly')} type="checkbox" />
          Read-only mode
        </InputLabel>
        <InputHint>
          allows you to run an application in read-only mode for a specific
          cluster
        </InputHint>
        <FormError>
          <ErrorMessage errors={errors} name="readOnly" />
        </FormError>
      </div>
      <div>
        <InputLabel htmlFor="bootstrapServers">Bootstrap Servers *</InputLabel>
        <InputHint>
          the list of Kafka brokers that you want to connect to
        </InputHint>
        <S.Container>
          {fields.map((field, index) => (
            <S.BootstrapServer key={field.id}>
              <div>
                <Input
                  name={`bootstrapServers.${index}.host`}
                  placeholder="Host"
                  type="text"
                  inputSize="L"
                />
                <FormError>
                  <ErrorMessage
                    errors={errors}
                    name={`bootstrapServers.${index}.host`}
                  />
                </FormError>
              </div>
              <div>
                <Input
                  name={`bootstrapServers.${index}.port`}
                  placeholder="Port"
                  type="number"
                  positiveOnly
                />
                <FormError>
                  <ErrorMessage
                    errors={errors}
                    name={`bootstrapServers.${index}.port`}
                  />
                </FormError>
              </div>
              <S.BootstrapServerActions
                aria-label="deleteProperty"
                onClick={() => remove(index)}
              >
                <CloseIcon aria-hidden />
              </S.BootstrapServerActions>
            </S.BootstrapServer>
          ))}
          <div>
            <Button
              type="button"
              buttonSize="M"
              buttonType="secondary"
              onClick={() => append({ host: '', port: '' })}
            >
              <PlusIcon />
              Add Bootstrap Server
            </Button>
          </div>
        </S.Container>

        <FormError>
          <ErrorMessage errors={errors} name="bootstrapServers" />
        </FormError>
      </div>
    </>
  );
};
export default KafkaCluster;
