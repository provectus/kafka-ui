import React from 'react';
import { useFormContext } from 'react-hook-form';

import SaslJaas from './SaslJaas';
import SaslGssapi from './SaslGssapi';
import SaslOauthbearer from './SaslOauthbearer';
import DelegationTokens from './DelegationTokens';
import SaslAwsIam from './SaslAwsIam';
import UsernamePassword from './UsernamePassword';
import MTLS from './MTLS';

const AuthenticationMethods = () => {
  const methods = useFormContext();
  const { watch } = methods;
  const saslMethods = watch('authentication.type');

  switch (saslMethods) {
    case 'SASL/JAAS':
      return <SaslJaas />;
    case 'SASL/GSSAPI':
      return <SaslGssapi />;
    case 'SASL/OAUTHBEARER':
      return <SaslOauthbearer />;
    case 'SASL/PLAIN':
    case 'SASL/SCRAM-256':
    case 'SASL/SCRAM-512':
    case 'SASL/LDAP':
      return <UsernamePassword />;
    case 'Delegation tokens':
      return <DelegationTokens />;
    case 'SASL/AWS IAM':
      return <SaslAwsIam />;
    case 'mTLS':
      return <MTLS />;
    default:
      return null;
  }
};

export default AuthenticationMethods;
