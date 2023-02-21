import React from 'react';
import { Button } from 'components/common/Button/Button';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import formSchema from 'components/Wizard/schema';
import { StyledForm } from 'components/common/Form/Form.styled';
import {
  useUpdateAppConfig,
  useValidateAppConfig,
} from 'lib/hooks/api/appConfig';
import { ClusterConfigFormValues } from 'components/Wizard/types';
import { transformFormDataToPayload } from 'components/Wizard/utils/transformFormDataToPayload';
import { showSuccessAlert } from 'lib/errorHandling';
import { getIsValidConfig } from 'components/Wizard/utils/getIsValidConfig';

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
  const update = useUpdateAppConfig();

  const onSubmit = async (data: ClusterConfigFormValues) => {
    const config = transformFormDataToPayload(data);
    await update.mutateAsync(config);
  };

  const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    methods.reset();
  };

  const onValidate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const data = methods.getValues();
    const config = transformFormDataToPayload(data);
    const response = await validate.mutateAsync(config);
    const isValid = getIsValidConfig(response, data.name);
    if (isValid) {
      showSuccessAlert({
        message: 'Configuration is valid',
      });
    }
  };

  const showCustomConfig = methods.watch('customAuth') && hasCustomConfig;

  const { isSubmitting } = methods.formState;
  const isSubmitDisabled = isSubmitting;

  return (
    <FormProvider {...methods}>
      <StyledForm onSubmit={methods.handleSubmit(onSubmit)}>
        <KafkaCluster />
        <hr />
        {!showCustomConfig ? <Authentication /> : <CustomAuthentication />}
        <hr />

        <SchemaRegistry />
        <hr />
        <KafkaConnect />
        <hr />
        <Metrics />
        <hr />
        <S.ButtonWrapper>
          <Button
            buttonSize="L"
            buttonType="secondary"
            onClick={onReset}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            buttonSize="L"
            buttonType="secondary"
            onClick={onValidate}
            disabled={isSubmitting}
          >
            Validate
          </Button>
          <Button
            type="submit"
            buttonSize="L"
            buttonType="primary"
            disabled={isSubmitDisabled}
          >
            Submit
          </Button>
        </S.ButtonWrapper>
      </StyledForm>
    </FormProvider>
  );
};

export default Wizard;
