import React from 'react';
import { Button } from 'components/common/Button/Button';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import formSchema from 'components/Wizard/schema';
import { StyledForm } from 'components/common/Form/Form.styled';

import * as S from './WizardForm.styled';
import KafkaCluster from './KafkaCluster/KafkaCluster';
import Authentication from './Authentication/Authentication';
import SchemaRegistry from './SchemaRegistry/SchemaRegistry';

type BootstrapServer = {
  host: string;
  port: string;
};
type SchemaRegistryType = {
  url: string;
  isAuth: boolean;
  username: string;
  password: string;
};
export type FormValues = {
  name: string;
  readOnly: boolean;
  bootstrapServers: BootstrapServer[];
  schemaRegistry: SchemaRegistryType;
};

interface WizardFormProps {
  initaialValues?: FormValues;
}

const Wizard: React.FC<WizardFormProps> = () => {
  const methods = useForm<FormValues>({
    mode: 'all',
    resolver: yupResolver(formSchema),
    defaultValues: {
      name: 'My test cluster',
      readOnly: true,
      bootstrapServers: [
        { host: 'loc1', port: '3001' },
        { host: 'loc', port: '3002' },
      ],
      schemaRegistry: {
        url: 'test URL',
        isAuth: true,
        username: 'reg',
        password: 'reg',
      },
    },
  });

  const onSubmit = (data: FormValues) => {
    // eslint-disable-next-line no-console
    console.log('SubmitData', data);
    return data;
  };

  return (
    <FormProvider {...methods}>
      <StyledForm onSubmit={methods.handleSubmit(onSubmit)}>
        <KafkaCluster />
        <hr />
        <Authentication />
        <SchemaRegistry />
        <hr />
        <S.Section>
          <S.SectionName>Kafka Connect</S.SectionName>
          <div>
            <Button buttonSize="M" buttonType="primary">
              Add Kafka Connect
            </Button>
          </div>
        </S.Section>
        <S.Section>
          <S.SectionName>JMX Metrics</S.SectionName>
          <div>
            <Button buttonSize="M" buttonType="primary">
              Configure JMX Metrics
            </Button>
          </div>
        </S.Section>
        <div style={{ paddingTop: '10px' }}>
          <div
            style={{
              justifyContent: 'center',
              display: 'flex',
              gap: '10px',
            }}
          >
            <Button buttonSize="M" buttonType="primary">
              Cancel
            </Button>
            <Button type="submit" buttonSize="M" buttonType="primary">
              Save
            </Button>
          </div>
        </div>
      </StyledForm>
    </FormProvider>
  );
};

export default Wizard;
