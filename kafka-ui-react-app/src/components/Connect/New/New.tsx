import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppParams from 'lib/hooks/useAppParams';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  clusterConnectConnectorPath,
  clusterConnectorsPath,
  ClusterNameRoute,
} from 'lib/paths';
import yup from 'lib/yupExtended';
import Editor from 'components/common/Editor/Editor';
import Select from 'components/common/Select/Select';
import { FormError } from 'components/common/Input/Input.styled';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Heading from 'components/common/heading/Heading.styled';
import { useConnects, useCreateConnector } from 'lib/hooks/api/kafkaConnect';
import get from 'lodash/get';
import { Connect } from 'generated-sources';

import * as S from './New.styled';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  config: yup.string().required().isJsonObject(),
});

interface FormValues {
  connectName: Connect['name'];
  name: string;
  config: string;
}

const New: React.FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const navigate = useNavigate();

  const { data: connects = [] } = useConnects(clusterName);
  const mutation = useCreateConnector(clusterName);

  const methods = useForm<FormValues>({
    mode: 'all',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      connectName: get(connects, '0.name', ''),
      name: '',
      config: '',
    },
  });
  const {
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, isValid, errors },
    getValues,
    setValue,
  } = methods;

  React.useEffect(() => {
    if (connects && connects.length > 0 && !getValues().connectName) {
      setValue('connectName', connects[0].name);
    }
  }, [connects, getValues, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      const connector = await mutation.createResource({
        connectName: values.connectName,
        newConnector: {
          name: values.name,
          config: JSON.parse(values.config.trim()),
        },
      });

      if (connector) {
        navigate(
          clusterConnectConnectorPath(
            clusterName,
            connector.connect,
            connector.name
          )
        );
      }
    } catch (e) {
      // do nothing
    }
  };

  const connectOptions = connects.map(({ name: connectName }) => ({
    value: connectName,
    label: connectName,
  }));

  return (
    <FormProvider {...methods}>
      <PageHeading
        text="Create new connector"
        backTo={clusterConnectorsPath(clusterName)}
        backText="Connectors"
      />
      <S.NewConnectFormStyled
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Create connect form"
      >
        <S.Filed $hidden={connects?.length <= 1}>
          <Heading level={3}>Connect *</Heading>
          <Controller
            defaultValue={connectOptions[0]?.value}
            control={control}
            name="connectName"
            render={({ field: { name, onChange } }) => (
              <Select
                selectSize="M"
                name={name}
                disabled={isSubmitting}
                onChange={onChange}
                value={connectOptions[0]?.value}
                minWidth="100%"
                options={connectOptions}
              />
            )}
          />
          <FormError>
            <ErrorMessage errors={errors} name="connectName" />
          </FormError>
        </S.Filed>

        <div>
          <Heading level={3}>Name</Heading>
          <Input
            inputSize="M"
            placeholder="Connector Name"
            name="name"
            autoFocus
            autoComplete="off"
            disabled={isSubmitting}
          />
          <FormError>
            <ErrorMessage errors={errors} name="name" />
          </FormError>
        </div>

        <div>
          <Heading level={3}>Config</Heading>
          <Controller
            control={control}
            name="config"
            render={({ field }) => (
              <Editor {...field} readOnly={isSubmitting} ref={null} />
            )}
          />
          <FormError>
            <ErrorMessage errors={errors} name="config" />
          </FormError>
        </div>
        <Button
          buttonSize="M"
          buttonType="primary"
          type="submit"
          disabled={!isValid || isSubmitting || !isDirty}
        >
          Submit
        </Button>
      </S.NewConnectFormStyled>
    </FormProvider>
  );
};

export default New;
