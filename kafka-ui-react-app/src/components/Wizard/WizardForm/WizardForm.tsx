import React, { useCallback } from 'react';
import { Button } from 'components/common/Button/Button';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import formSchema from 'components/Wizard/schema';

import * as S from './WizardForm.styled';
import KafkaCluster from './KafkaCluster/KafkaCluster';
import Authentication from './Authentication/Authentication';
import SchemaRegistry from './SchemaRegistry/SchemaRegistry';
import JMXMetrics from './JMXMetrics/JMXMetrics';

type BootstrapServersType = {
  host: string;
  port: string;
};
export type FormValues = {
  kafkaCluster: {
    bootstrapServers: BootstrapServersType[];
  };
};

interface WizardFormProps {
  initaialValues?: FormValues;
}

const Wizard: React.FC<WizardFormProps> = () => {
  const methods = useForm<FormValues>({
    mode: 'all',
    resolver: yupResolver(formSchema),
    defaultValues: {
      kafkaCluster: {
        bootstrapServers: [{ host: '', port: '' }],
      },
    },
  });

  const { control } = methods;
  const { fields, append, remove } = useFieldArray<
    FormValues,
    'kafkaCluster.bootstrapServers'
  >({
    control,
    name: 'kafkaCluster.bootstrapServers',
  });
  const handleAddNewProperty = useCallback(() => {
    append({ host: '', port: '' });
  }, []);
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
            fields={fields}
            remove={remove}
          />
          <Authentication />
          <SchemaRegistry />
          <S.Section>
            <S.SectionName>Kafka Connect</S.SectionName>
            <div>
              <Button buttonSize="M" buttonType="primary">
                Add Kafka Connect
              </Button>
            </div>
          </S.Section>
          <JMXMetrics />
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
