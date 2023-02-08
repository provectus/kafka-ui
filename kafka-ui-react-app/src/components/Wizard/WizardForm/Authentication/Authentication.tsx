import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import Input from 'components/common/Input/Input';
import { AUTH_OPTIONS, SECURITY_PROTOCOL_OPTIONS } from 'lib/constants';
import Heading from 'components/common/heading/Heading.styled';
import FileField from 'components/common/FileField/FileField';
import ControlledSelect from 'components/common/Select/ControlledSelect';

import AuthenticationMethods from './AuthenticationMethods/AuthenticationMethods';

const Authentication: React.FC = () => {
  const { watch, setValue } = useFormContext();

  const securityProtocol = watch('securityProtocol');
  const authMethod = watch('authentication.method');

  const isSecurityProtocolDisabled = authMethod === 'mTLS';

  const authMethodChange = useCallback(
    (val: string | number) => {
      if (val === 'mTLS') setValue('securityProtocol', 'SASL_SSL');
    },
    [setValue]
  );

  return (
    <>
      <Heading level={3}>Authentication</Heading>
      <ControlledSelect
        name="securityProtocol"
        label="Security Protocol"
        options={SECURITY_PROTOCOL_OPTIONS}
        disabled={isSecurityProtocolDisabled}
      />

      {securityProtocol === 'SASL_SSL' && (
        <>
          <FileField
            name="authentication.sslTruststoreFile"
            label="Truststore File Location"
          />
          <Input
            type="password"
            name="saslPassword"
            label="Truststore Password"
            withError
          />
        </>
      )}
      <ControlledSelect
        name="authentication.method"
        label="Authentication Method"
        options={AUTH_OPTIONS}
        onChange={authMethodChange}
      />
      <AuthenticationMethods method={authMethod} />
    </>
  );
};

export default Authentication;
