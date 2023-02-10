import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AUTH_OPTIONS, SECURITY_PROTOCOL_OPTIONS } from 'lib/constants';
import Heading from 'components/common/heading/Heading.styled';
import ControlledSelect from 'components/common/Select/ControlledSelect';

import AuthenticationMethods from './AuthenticationMethods/AuthenticationMethods';

const Authentication: React.FC = () => {
  const { watch } = useFormContext();

  const authMethod = watch('authMethod');

  const hasSecurityProtocolField = ![
    'none',
    'Delegation tokens',
    'mTLS',
  ].includes(authMethod);

  return (
    <>
      <Heading level={3}>Authentication</Heading>
      <ControlledSelect
        name="authMethod"
        label="Authentication Method"
        options={AUTH_OPTIONS}
      />
      {hasSecurityProtocolField && (
        <ControlledSelect
          name="authentication.securityProtocol"
          label="Security Protocol"
          placeholder="Select security protocol"
          options={SECURITY_PROTOCOL_OPTIONS}
        />
      )}

      <AuthenticationMethods method={authMethod} />
    </>
  );
};

export default Authentication;
