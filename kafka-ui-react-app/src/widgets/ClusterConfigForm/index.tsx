import React from 'react';
import { Button } from 'components/common/Button/Button';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import formSchema from 'widgets/ClusterConfigForm/schema';
import { StyledForm } from 'components/common/Form/Form.styled';
import {
  useUpdateAppConfig,
  useValidateAppConfig,
} from 'lib/hooks/api/appConfig';
import { ClusterConfigFormValues } from 'widgets/ClusterConfigForm/types';
import { transformFormDataToPayload } from 'widgets/ClusterConfigForm/utils/transformFormDataToPayload';
import { showSuccessAlert } from 'lib/errorHandling';
import { getIsValidConfig } from 'widgets/ClusterConfigForm/utils/getIsValidConfig';
import * as S from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';

import KafkaCluster from './KafkaCluster';
import SchemaRegistry from './SchemaRegistry';
import KafkaConnect from './KafkaConnect';
import Metrics from './Metrics';
import CustomAuthentication from './Authentication/CustomAuthentication';
import Authentication from './Authentication/Authentication';

interface ClusterConfigFormProps {
  hasCustomConfig?: boolean;
  initialValues?: Partial<ClusterConfigFormValues>;
}

const CLUSTER_CONFIG_FORM_DEFAULT_VALUES: Partial<ClusterConfigFormValues> = {
  bootstrapServers: [{ host: '', port: '' }],
};

const ClusterConfigForm: React.FC<ClusterConfigFormProps> = ({
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
  const update = useUpdateAppConfig({ initialName: initialValues.name });

  const onSubmit = async (data: ClusterConfigFormValues) => {
    const config = transformFormDataToPayload(data);
    await update.mutateAsync(config);
  };

  const onReset = () => methods.reset();

  const onValidate = async () => {
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

export default ClusterConfigForm;
