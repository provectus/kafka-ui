import React, { useCallback } from 'react';
import { Button } from 'components/common/Button/Button';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import formSchema from 'components/Wizard/schema';

import * as S from './WizardForm.styled';
import KafkaCluster from './KafkaCluster/KafkaCluster';
import Authentication from './Authentication/Authentication';
import SchemaRegistry from './SchemaRegistry/SchemaRegistry';
import KafkaConnect from './KafkaConnect/KafkaConnect';

type BootstrapServersType = {
  host: string;
  port: string;
};
export type FormValues = {
  kafkaCluster: {
    clusterName: string;
    readOnly: boolean;
    bootstrapServers: BootstrapServersType[];
    sharedConfluentCloudCluster: boolean;
  };
  schemaRegistry: {
    url: string;
    isAuth: boolean;
    username: string;
    password: string;
  };
  kafkaConnect: {
    name: string;
    url: string;
    isAuth: boolean;
    username: string;
    password: string;
  }[];
};
const Wizard: React.FC = () => {
  const methods = useForm<FormValues>({
    mode: 'all',
    resolver: yupResolver(formSchema),
    defaultValues: {
      kafkaCluster: {
        clusterName: '',
        readOnly: false,
        bootstrapServers: [{ host: '', port: '' }],
        sharedConfluentCloudCluster: false,
      },
      schemaRegistry: {
        url: '',
        isAuth: false,
        username: '',
        password: '',
      },
      kafkaConnect: [
        {
          name: '',
          url: '',
          isAuth: false,
          username: '',
          password: '',
        },
      ],
    },
  });

  const { control } = methods;
  const {
    fields: fieldsBootstrap,
    append: appendBootstrap,
    remove: removeBootstrap,
  } = useFieldArray<FormValues, 'kafkaCluster.bootstrapServers'>({
    control,
    name: 'kafkaCluster.bootstrapServers',
  });
  const handleAddNewProperty = useCallback(() => {
    appendBootstrap({ host: '', port: '' });
  }, []);

  const {
    fields: fieldsConnect,
    append: appendConnect,
    remove: removeConnect,
  } = useFieldArray<FormValues, 'kafkaConnect'>({
    control,
    name: 'kafkaConnect',
  });

  const addConnect: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    appendConnect({
      name: '',
      url: '',
      isAuth: false,
      username: '',
      password: '',
    });
  };
  const onSubmit = (data: unknown) => {
    // eslint-disable-next-line no-console
    console.log('SubmitData', data);
    return data;
  };

  return (
    <div style={{ padding: '15px' }}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <KafkaCluster
            handleAddNewProperty={handleAddNewProperty}
            fields={fieldsBootstrap}
            remove={removeBootstrap}
          />
          <Authentication />
          <SchemaRegistry />
          <KafkaConnect
            addConnect={addConnect}
            kafkaConnects={fieldsConnect}
            removeConnect={removeConnect}
          />
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
              }}
            >
              <Button buttonSize="M" buttonType="primary">
                Cancel
              </Button>
              <Button
                style={{ marginLeft: '15px' }}
                type="submit"
                buttonSize="M"
                buttonType="primary"
              >
                Save
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default Wizard;
