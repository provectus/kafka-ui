import React from 'react';
import { Button } from 'components/common/Button/Button';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import formSchema from 'components/Wizard/schema';
import { StyledForm } from 'components/common/Form/Form.styled';
import { useValidateAppConfig } from 'lib/hooks/api/appConfig';
import { ClusterConfigFormValues } from 'components/Wizard/types';
import { transformFormDataToPayload } from 'components/Wizard/utils/transformFormDataToPayload';

import * as S from './WizardForm.styled';
import KafkaCluster from './KafkaCluster/KafkaCluster';
import Authentication from './Authentication/Authentication';
import SchemaRegistry from './SchemaRegistry/SchemaRegistry';
import KafkaConnect from './KafkaConnect/KafkaConnect';
import Metrics from './Metrics/Metrics';
import CustomAuthentication from './Authentication/CustomAuthentication';

interface WizardFormProps {
  hasCustomConfig?: boolean;
  initialValues?: Partial<ClusterConfigFormValues>;
}

const CLUSTER_CONFIG_FORM_DEFAULT_VALUES: Partial<ClusterConfigFormValues> = {
  bootstrapServers: [{ host: '', port: '' }],
};

const Wizard: React.FC<WizardFormProps> = ({
  initialValues = {},
  hasCustomConfig,
}) => {
  const methods = useForm<ClusterConfigFormValues>({
    mode: 'all',
    resolver: yupResolver(formSchema),
    defaultValues: {
      ...CLUSTER_CONFIG_FORM_DEFAULT_VALUES,
      ...initialValues,
    },
  });

  const validate = useValidateAppConfig();

  const onSubmit = async (data: ClusterConfigFormValues) => {
    // eslint-disable-next-line no-console
    console.log('SubmitData', data);

    const config = transformFormDataToPayload(data);
    const resp = await validate.mutateAsync(config);

    // eslint-disable-next-line no-console
    console.log('resp', resp);

    return data;
  };

  const onReset = () => {
    methods.reset();
  };
  // eslint-disable-next-line no-console
  console.log('Errors:', methods.formState.errors);

  return (
    <FormProvider {...methods}>
      <StyledForm onSubmit={methods.handleSubmit(onSubmit)}>
        <KafkaCluster />
        <hr />
        {!hasCustomConfig ? <Authentication /> : <CustomAuthentication />}
        <hr />

        <SchemaRegistry />
        <hr />
        <KafkaConnect />
        <hr />
        <Metrics />
        <hr />
        <S.ButtonWrapper>
          <Button buttonSize="L" buttonType="primary" onClick={onReset}>
            Reset
          </Button>
          <Button type="submit" buttonSize="L" buttonType="primary">
            Validate
          </Button>
        </S.ButtonWrapper>
      </StyledForm>
    </FormProvider>
  );
};

export default Wizard;
