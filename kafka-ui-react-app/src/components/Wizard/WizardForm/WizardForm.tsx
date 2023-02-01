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

const securityProtocolOptions = [
  {
    value: 'none',
    label: 'None',
  },
  {
    value: 'sasl_ssl',
    label: 'SASL_SSL',
  },
  {
    value: 'sasl_plaintext',
    label: 'SASL_PLAINTEXT',
  },
];
const options = [
  {
    value: 'none',
    label: 'None',
  },
  {
    value: 'SASL/JAAS',
    label: 'SASL/JAAS',
  },
  {
    value: 'SASL/GSSAPI',
    label: 'SASL/GSSAPI',
  },
  {
    value: 'SASL/OAUTHBEARER',
    label: 'SASL/OAUTHBEARER',
  },
  {
    value: 'SASL/PLAIN',
    label: 'SASL/PLAIN',
  },
  {
    value: 'SASL/SCRAM-256',
    label: 'SASL/SCRAM-256',
  },
  {
    value: 'SASL/SCRAM-512',
    label: 'SASL/SCRAM-512',
  },
  {
    value: 'Delegation tokens',
    label: 'Delegation tokens',
  },
  {
    value: 'SASL/LDAP',
    label: 'SASL/LDAP',
  },
  {
    value: 'SASL/AWS IAM',
    label: 'SASL/AWS IAM',
  },
  {
    value: 'mTLS',
    label: 'mTLS',
  },
];
export interface IOption {
  value: string;
  label: string;
}
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
    fields: bootstrapFields,
    append: bootstrapAppend,
    remove: bootstrapRemove,
  } = useFieldArray<FormValues, 'kafkaCluster.bootstrapServers'>({
    control,
    name: 'kafkaCluster.bootstrapServers',
  });
  const handleAddNewProperty = useCallback(() => {
    bootstrapAppend({ host: '', port: '' });
  }, []);

  const {
    fields: connectFields,
    append: connectAppend,
    remove: connectRemove,
  } = useFieldArray<FormValues, 'kafkaConnect'>({
    control,
    name: 'kafkaConnect',
  });

  const handleAddKafkaConnect: React.MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    e.stopPropagation();
    connectAppend({
      name: '',
      url: '',
      isAuth: false,
      username: '',
      password: '',
    });
  };
  const onSubmit = (data: unknown) => {
    // console.log('SubmitData', data);
    return data;
  };
  // useEffect(() => {
  //   const subscription = methods.watch((data) => console.log(data));
  //   return subscription.unsubscribe;
  // }, [methods.watch]);
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
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <KafkaCluster
            handleAddNewProperty={handleAddNewProperty}
            fields={bootstrapFields}
            remove={bootstrapRemove}
          />
          <Authentication
            options={options}
            securityProtocolOptions={securityProtocolOptions}
          />
          <SchemaRegistry />
          <KafkaConnect
            handleAddKafkaConnect={handleAddKafkaConnect}
            fields={connectFields}
            remove={connectRemove}
          />
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
        </form>
      </FormProvider>
    </div>
  );
};

export default Wizard;
