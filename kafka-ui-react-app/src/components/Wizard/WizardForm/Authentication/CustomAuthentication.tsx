import React from 'react';
import { useFormContext } from 'react-hook-form';
import Heading from 'components/common/heading/Heading.styled';
import { Button } from 'components/common/Button/Button';
import {
  FlexGrow1,
  FlexRow,
} from 'components/Wizard/WizardForm/WizardForm.styled';
import Input from 'components/common/Input/Input';

const CustomAuthentication: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const customConf = watch('customAuth');
  const hasCustomConfig =
    customConf && Object.values(customConf).some((v) => !!v);

  const toggle = () => setValue('customAuth', hasCustomConfig ? undefined : {});

  return (
    <>
      <FlexRow>
        <FlexGrow1>
          <Heading level={3}>Authentication</Heading>
        </FlexGrow1>
        <Button buttonSize="M" buttonType="primary" onClick={toggle}>
          {hasCustomConfig ? 'Remove from config' : 'Configure Authentication'}
        </Button>
      </FlexRow>
      {hasCustomConfig && (
        <>
          <Input
            type="text"
            name="customAuth.securityProtocol"
            label="security.protocol"
            withError
          />
          <Input
            type="text"
            name="customAuth.saslMechanism"
            label="sasl.mechanism"
            withError
          />
          <Input
            type="text"
            name="customAuth.saslEnabledMechanisms"
            label="sasl.enabled.mechanisms"
            withError
          />
          <Input
            type="text"
            name="customAuth.saslJaasConfig"
            label="sasl.jaas.config"
            withError
          />
          <Input
            type="text"
            name="customAuth.saslKerberosServiceName"
            label="sasl.kerberos.service.name"
            withError
          />
          <Input
            type="text"
            name="customAuth.saslClientCallbackHandlerClass"
            label="sasl.client.callback.handler.class"
            withError
          />
        </>
      )}
    </>
  );
};

export default CustomAuthentication;
