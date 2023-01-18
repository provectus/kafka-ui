import React from 'react';
import Input from 'components/common/Input/Input';
import { Controller, useFormContext } from 'react-hook-form';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseIcon from 'components/common/Icons/CloseIcon';
import { Button } from 'components/common/Button/Button';
import PlusIcon from 'components/common/Icons/PlusIcon';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';

type PropType = {
  handleAddNewProperty: () => void;
  remove: (index: number) => void;
  fields: Tfield[];
};
type Tfield = {
  id: string;
  host: string;
  port: string;
};
const KafkaCluster: React.FC<PropType> = ({
  handleAddNewProperty,
  remove,
  fields,
}) => {
  const methods = useFormContext();
  methods.watch(['readOnly', 'sharedConfluentCloudCluster']);
  return (
    <S.Section>
      <S.SectionName>Kafka Cluster</S.SectionName>
      <S.Action>
        <S.ActionItem>
          <S.ItemStyled>
            <label htmlFor="clusterName">Cluster Name</label>{' '}
            <S.P>
              this name will help you recognize the cluster in the application
              interface
            </S.P>
          </S.ItemStyled>
          <Input id="clusterName" type="text" name="clusterName" />
          <FormError>
            <ErrorMessage
              errors={methods.formState.errors}
              name="clusterName"
            />
          </FormError>
        </S.ActionItem>
        <S.ActionItem>
          <S.ReadOnly>
            <input
              {...methods.register('readOnly')}
              name="readOnly"
              type="checkbox"
            />
            <div>
              <label htmlFor="readOnly">Read-only mode</label>{' '}
              <p>
                allows you to run an application in read-only mode for a
                specific cluster
              </p>
              <FormError>
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="readOnly"
                />
              </FormError>
            </div>
          </S.ReadOnly>
        </S.ActionItem>
        <S.ActionItem>
          <S.ItemStyled>
            <label
              className="block text-sm font-medium text-gray-700 whitespace-nowrap mr-2 svelte-55p6jf required"
              htmlFor="bootstrapServers"
            >
              Bootstrap Servers
            </label>{' '}
            <S.P>the list of Kafka brokers that you want to connect to</S.P>
          </S.ItemStyled>
          <S.BootstrapServersContainer>
            {fields.map((item, index) => (
              <S.InputsContainer key={item.id}>
                <S.BootstrapServersWrapper>
                  <Controller
                    control={methods.control}
                    name={`bootstrapServers.${index}.host`}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Host"
                        aria-label="host"
                        type="text"
                      />
                    )}
                  />
                  <FormError>
                    <ErrorMessage
                      errors={methods.formState.errors}
                      name={`bootstrapServers.${index}.host`}
                    />
                  </FormError>
                </S.BootstrapServersWrapper>
                <S.BootstrapServersWrapper>
                  <Controller
                    control={methods.control}
                    name={`bootstrapServers.${index}.port`}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Port"
                        aria-label="port"
                        type="number"
                      />
                    )}
                  />
                  <FormError>
                    <ErrorMessage
                      errors={methods.formState.errors}
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
              onClick={handleAddNewProperty}
            >
              <PlusIcon />
              Add Bootstrap Server
            </Button>
          </S.BootstrapServersContainer>
        </S.ActionItem>
        <S.ActionItem>
          <S.SharedConfluentCloudCluster>
            <input
              {...methods.register('sharedConfluentCloudCluster')}
              name="sharedConfluentCloudCluster"
              type="checkbox"
            />
            <label htmlFor="sharedConfluentCloudCluster">
              Shared confluent cloud cluster
            </label>
            <FormError>
              <ErrorMessage
                errors={methods.formState.errors}
                name="sharedConfluentCloudCluster"
              />
            </FormError>
          </S.SharedConfluentCloudCluster>
        </S.ActionItem>
      </S.Action>
    </S.Section>
  );
};
export default KafkaCluster;
