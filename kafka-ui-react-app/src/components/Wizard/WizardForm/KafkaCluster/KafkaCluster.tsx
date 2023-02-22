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
import Checkbox from 'components/common/Checkbox/Checkbox';
import Fileupload from 'components/Wizard/WizardForm/Fileupload';

const KafkaCluster: React.FC = () => {
  const { control, watch, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bootstrapServers',
  });

  const hasTrustStore = !!watch('truststore');
  const hasKeyStore = !!watch('keystore');

  const toggleSection = (section: string) => () =>
    setValue(
      section,
      watch(section)
        ? undefined
        : {
            location: '',
            password: '',
          }
    );

  return (
    <>
      <Heading level={3}>Kafka Cluster</Heading>
      <Input
        label="Cluster name *"
        type="text"
        name="name"
        withError
        hint="this name will help you recognize the cluster in the application interface"
      />
      <Checkbox
        name="readOnly"
        label="Read-only mode"
        hint="allows you to run an application in read-only mode for a specific cluster"
      />
      <div>
        <InputLabel htmlFor="bootstrapServers">Bootstrap Servers *</InputLabel>
        <InputHint>
          the list of Kafka brokers that you want to connect to
        </InputHint>
        <S.ArrayFieldWrapper>
          {fields.map((field, index) => (
            <S.BootstrapServer key={field.id}>
              <div>
                <Input
                  name={`bootstrapServers.${index}.host`}
                  placeholder="Host"
                  type="text"
                  inputSize="L"
                  withError
                />
              </div>
              <div>
                <Input
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
        </S.ArrayFieldWrapper>
      </div>
      <hr />
      <S.FlexRow>
        <S.FlexGrow1>
          <Heading level={3}>Truststore</Heading>
        </S.FlexGrow1>
        <Button
          buttonSize="M"
          buttonType="primary"
          onClick={toggleSection('truststore')}
        >
          {hasTrustStore ? 'Remove from config' : 'Add Truststore'}
        </Button>
      </S.FlexRow>
      {hasTrustStore && (
        <>
          <Fileupload name="truststore.location" label="Truststore Location" />
          <Input
            label="Truststore Password"
            type="password"
            name="truststore.password"
            withError
          />
        </>
      )}
      <hr />

      <S.FlexRow>
        <S.FlexGrow1>
          <Heading level={3}>Keystore</Heading>
        </S.FlexGrow1>
        <Button
          buttonSize="M"
          buttonType="primary"
          onClick={toggleSection('keystore')}
        >
          {hasKeyStore ? 'Remove from config' : 'Add Keystore'}
        </Button>
      </S.FlexRow>
      {hasKeyStore && (
        <>
          <Fileupload name="keystore.location" label="Keystore Location" />
          <Input
            label="Keystore Password"
            type="password"
            name="keystore.password"
            withError
          />
        </>
      )}
    </>
  );
};
export default KafkaCluster;
