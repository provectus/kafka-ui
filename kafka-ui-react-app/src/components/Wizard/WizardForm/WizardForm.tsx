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
import JMXMetrics from './JMXMetrics/JMXMetrics';

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
  schemaRegistry?: SchemaRegistryType;
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
        url: '',
        isAuth: false,
        username: '',
        password: '',
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
        <JMXMetrics />
        <hr />
        <S.ButtonWrapper>
          <Button buttonSize="L" buttonType="primary">
            Cancel
          </Button>
          <Button type="submit" buttonSize="L" buttonType="primary">
            Save
          </Button>
        </S.ButtonWrapper>
      </StyledForm>
    </FormProvider>
  );
};

export default Wizard;
