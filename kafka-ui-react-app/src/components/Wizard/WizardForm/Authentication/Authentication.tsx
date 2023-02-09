import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AUTH_OPTIONS, SECURITY_PROTOCOL_OPTIONS } from 'lib/constants';
import Heading from 'components/common/heading/Heading.styled';
import ControlledSelect from 'components/common/Select/ControlledSelect';

import AuthenticationMethods from './AuthenticationMethods/AuthenticationMethods';

const Authentication: React.FC = () => {
  const { watch } = useFormContext();

  const authMethod = watch('authentication.method');

  const hasSecurityProtocolField = ![
    'none',
    'Delegation tokens',
    'mTLS',
  ].includes(authMethod);

  return (
    <>
      <Heading level={3}>Authentication</Heading>
      <ControlledSelect
        name="authentication.method"
        label="Authentication Method"
        options={AUTH_OPTIONS}
      />
      {hasSecurityProtocolField && (
        <ControlledSelect
          name="securityProtocol"
          label="Security Protocol"
          options={SECURITY_PROTOCOL_OPTIONS}
        />
      )}

      <AuthenticationMethods method={authMethod} />
    </>
  );
};

export default Authentication;
