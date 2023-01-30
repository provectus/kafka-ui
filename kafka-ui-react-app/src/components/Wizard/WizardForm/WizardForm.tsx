import React, { useCallback } from 'react';
import { Button } from 'components/common/Button/Button';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import formSchema from 'components/Wizard/schema';

import * as S from './WizardForm.styled';
import KafkaCluster from './KafkaCluster/KafkaCluster';
import Authentication from './Authentication/Authentication';
import SchemaRegistry from './SchemaRegistry/SchemaRegistry';

type BootstrapServersType = {
  host: string;
  port: string;
};
export type FormValues = {
  bootstrapServers: BootstrapServersType[];
};
const Wizard: React.FC = () => {
  const methods = useForm<FormValues>({
    mode: 'all',
    resolver: yupResolver(formSchema),
    defaultValues: {
      bootstrapServers: [{ host: '', port: '' }],
    },
  });

  const { control } = methods;
  const { fields, append, remove } = useFieldArray<
    FormValues,
    'bootstrapServers'
  >({
    control,
    name: 'bootstrapServers',
  });

  const handleAddNewProperty = useCallback(() => {
    if (
      methods.getValues().bootstrapServers.every((prop) => {
        return prop.host;
      })
    ) {
      append({ host: '', port: '' });
    }
  }, []);
  return (
    <div style={{ padding: '15px' }}>
      <Button
        style={{ marginBottom: '0.75rem' }}
        buttonSize="M"
        buttonType="primary"
      >
        Back
      </Button>
      <hr />
      <FormProvider {...methods}>
        <KafkaCluster
          handleAddNewProperty={handleAddNewProperty}
          fields={fields}
          remove={remove}
        />
        <Authentication />
        <SchemaRegistry />

        <S.Section>
          <S.SectionName className="text-lg font-medium leading-6 text-gray-900">
            Kafka Connect
          </S.SectionName>
          <div className="md:mt-0 md:col-span-3">
            <div className="sm:overflow-hidden h-full">
              <div className="px-4 py-5">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-5">
                    <Button buttonSize="M" buttonType="primary">
                      Add Kafka Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </S.Section>
        <S.Section>
          <S.SectionName className="text-lg font-medium leading-6 text-gray-900">
            JMX Metrics
          </S.SectionName>
          <div className="md:mt-0 md:col-span-3">
            <div className="sm:overflow-hidden h-full">
              <div className="px-4 py-5">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-5">
                    <Button buttonSize="M" buttonType="primary">
                      Configure JMX Metrics
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
      </FormProvider>
    </div>
  );
};

export default Wizard;
