import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { Connect, Connector, NewConnector } from 'generated-sources';
import { ClusterName, ConnectName } from 'redux/interfaces';
import { clusterConnectConnectorPath } from 'lib/paths';
import yup from 'lib/yupExtended';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import PageLoader from 'components/common/PageLoader/PageLoader';
import InputLabel from 'components/common/Input/InputLabel.styled';
import Select from 'components/common/Select/Select';
import { FormError } from 'components/common/Input/Input.styled';
import Input from 'components/common/Input/Input';
import { Button } from 'components/common/Button/Button';
import styled from 'styled-components';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  config: yup.string().required().isJsonObject(),
});

interface RouterParams {
  clusterName: ClusterName;
}

const NewConnectFormStyled = styled.form`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  & > button:last-child {
    align-self: flex-start;
  }
`;

export interface NewProps {
  fetchConnects(clusterName: ClusterName): void;
  areConnectsFetching: boolean;
  connects: Connect[];
  createConnector(
    clusterName: ClusterName,
    connectName: ConnectName,
    newConnector: NewConnector
  ): Promise<Connector | undefined>;
}

interface FormValues {
  connectName: ConnectName;
  name: string;
  config: string;
}

const New: React.FC<NewProps> = ({
  fetchConnects,
  areConnectsFetching,
  connects,
  createConnector,
}) => {
  const { clusterName } = useParams<RouterParams>();
  const history = useHistory();

  const methods = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      connectName: connects[0]?.name || '',
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
    fetchConnects(clusterName);
  }, [fetchConnects, clusterName]);

  React.useEffect(() => {
    if (connects && connects.length > 0 && !getValues().connectName) {
      setValue('connectName', connects[0].name);
    }
  }, [connects, getValues, setValue]);

  const connectNameFieldClassName = React.useMemo(
    () => (connects.length > 1 ? '' : 'is-hidden'),
    [connects]
  );

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      const connector = await createConnector(clusterName, values.connectName, {
        name: values.name,
        config: JSON.parse(values.config),
      });
      if (connector) {
        history.push(
          clusterConnectConnectorPath(
            clusterName,
            connector.connect,
            connector.name
          )
        );
      }
    },
    [createConnector, clusterName]
  );

  if (areConnectsFetching) {
    return <PageLoader />;
  }

  if (connects.length === 0) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <NewConnectFormStyled onSubmit={handleSubmit(onSubmit)}>
        <div className={['field', connectNameFieldClassName].join(' ')}>
          <InputLabel>Connect *</InputLabel>
          <Select selectSize="M" name="connectName" disabled={isSubmitting}>
            {connects.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
          <FormError>
            <ErrorMessage errors={errors} name="connectName" />
          </FormError>
        </div>

        <div>
          <InputLabel>Name *</InputLabel>
          <Input
            inputSize="M"
            placeholder="Connector Name"
            name="name"
            autoComplete="off"
            disabled={isSubmitting}
          />
          <FormError>
            <ErrorMessage errors={errors} name="name" />
          </FormError>
        </div>

        <div>
          <InputLabel>Config *</InputLabel>
          <Controller
            control={control}
            name="config"
            render={({ field }) => (
              <JSONEditor {...field} readOnly={isSubmitting} />
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
      </NewConnectFormStyled>
    </FormProvider>
  );
};

export default New;
