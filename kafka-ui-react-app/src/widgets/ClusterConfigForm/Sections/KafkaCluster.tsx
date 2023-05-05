import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormError, InputHint } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import CloseIcon from 'components/common/Icons/CloseIcon';
import { Button } from 'components/common/Button/Button';
import PlusIcon from 'components/common/Icons/PlusIcon';
import * as S from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import Heading from 'components/common/heading/Heading.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import ControlledCheckbox from 'components/common/Checkbox/ControlledCheckbox';
import SectionHeader from 'widgets/ClusterConfigForm/common/SectionHeader';
import SSLForm from 'widgets/ClusterConfigForm/common/SSLForm';
import ControlledInput from 'components/common/Input/ControlledInput';

const KafkaCluster: React.FC = () => {
  const { control, watch, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bootstrapServers',
  });

  const hasTrustStore = !!watch('truststore');

  const toggleSection = (section: string) => () =>
    setValue(
      section,
      watch(section)
        ? undefined
        : {
            location: '',
            password: '',
          },
      { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    );

  return (
    <>
      <Heading level={3}>Kafka Cluster</Heading>
      <ControlledInput
        label="Cluster name *"
        type="text"
        name="name"
        withError
        hint="this name will help you recognize the cluster in the application interface"
      />
      <ControlledCheckbox
        name="readOnly"
        label="Read-only mode"
        hint="allows you to run an application in read-only mode for a specific cluster"
      />
      <div>
        <InputLabel htmlFor="bootstrapServers">Bootstrap Servers *</InputLabel>
        <InputHint>
          the list of Kafka brokers that you want to connect to
        </InputHint>
        <S.GroupFieldWrapper>
          {fields.map((field, index) => (
            <S.BootstrapServer key={field.id}>
              <div>
                <ControlledInput
                  name={`bootstrapServers.${index}.host`}
                  placeholder="Host"
                  type="text"
                  inputSize="L"
                  withError
                />
              </div>
              <div>
                <ControlledInput
                  name={`bootstrapServers.${index}.port`}
                  placeholder="Port"
                  type="number"
                  positiveOnly
                  withError
                />
              </div>
              <S.BootstrapServerActions
                aria-label="deleteProperty"
                onClick={() => remove(index)}
              >
                <CloseIcon aria-hidden />
              </S.BootstrapServerActions>
            </S.BootstrapServer>
          ))}
          <FormError>
            <ErrorMessage name="bootstrapServers" />
          </FormError>
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
        </S.GroupFieldWrapper>
      </div>
      <hr />
      <SectionHeader
        title="Truststore"
        addButtonText="Configure Truststore"
        adding={!hasTrustStore}
        onClick={toggleSection('truststore')}
      />
      {hasTrustStore && <SSLForm prefix="truststore" title="Truststore" />}
    </>
  );
};
export default KafkaCluster;
