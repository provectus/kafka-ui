import React from 'react';
import Input from 'components/common/Input/Input';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseIcon from 'components/common/Icons/CloseIcon';
import { Button } from 'components/common/Button/Button';
import PlusIcon from 'components/common/Icons/PlusIcon';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';

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
    <S.Section>
      <S.SectionName>Kafka Cluster</S.SectionName>
      <S.Action>
        <S.ActionItem>
          <S.ItemLabelRequired>
            <label htmlFor="name">Cluster Name</label>{' '}
            <S.P>
              this name will help you recognize the cluster in the application
              interface
            </S.P>
          </S.ItemLabelRequired>
          <Input id="name" type="text" name="name" />
          <FormError>
            <ErrorMessage errors={errors} name="name" />
          </FormError>
        </S.ActionItem>
        <S.ActionItem>
          <S.ReadOnly>
            <input {...register('readOnly')} type="checkbox" />
            <div>
              <label htmlFor="readOnly">Read-only mode</label>{' '}
              <p>
                allows you to run an application in read-only mode for a
                specific cluster
              </p>
              <FormError>
                <ErrorMessage errors={errors} name="readOnly" />
              </FormError>
            </div>
          </S.ReadOnly>
        </S.ActionItem>
        <S.ActionItem>
          <S.ItemLabelRequired>
            <label htmlFor="bootstrapServers">Bootstrap Servers</label>
            <S.P>the list of Kafka brokers that you want to connect to</S.P>
          </S.ItemLabelRequired>
          <S.BootstrapServersContainer>
            {fields.map((field, index) => (
              <S.InputsContainer key={field.id}>
                <S.BootstrapServersWrapper>
                  <Input
                    name={`bootstrapServers.${index}.host`}
                    placeholder="Host"
                    type="text"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name={`bootstrapServers.${index}.host`}
                    />
                  </FormError>
                </S.BootstrapServersWrapper>
                <S.BootstrapServersWrapper>
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
                </S.BootstrapServersWrapper>

                <S.DeleteButtonWrapper onClick={() => remove(index)}>
                  <IconButtonWrapper aria-label="deleteProperty">
                    <CloseIcon aria-hidden />
                  </IconButtonWrapper>
                </S.DeleteButtonWrapper>
              </S.InputsContainer>
            ))}
            <Button
              type="button"
              buttonSize="M"
              buttonType="secondary"
              onClick={() => append({ host: '', port: '' })}
            >
              <PlusIcon />
              Add Bootstrap Server
            </Button>
          </S.BootstrapServersContainer>
        </S.ActionItem>
        <S.ActionItem>
          <S.CheckboxWrapper>
            <input {...register('sharedConfluentCloud')} type="checkbox" />
            <label htmlFor="sharedConfluentCloud">
              Shared confluent cloud cluster
            </label>
            <FormError>
              <ErrorMessage errors={errors} name="sharedConfluentCloud" />
            </FormError>
          </S.CheckboxWrapper>
        </S.ActionItem>
      </S.Action>
    </S.Section>
  );
};
export default KafkaCluster;
