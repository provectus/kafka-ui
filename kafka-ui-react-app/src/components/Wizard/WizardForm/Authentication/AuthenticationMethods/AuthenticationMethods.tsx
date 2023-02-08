import React from 'react';

import SaslJaas from './SaslJaas';
import SaslGssapi from './SaslGssapi';
import SaslOauthbearer from './SaslOauthbearer';
import DelegationTokens from './DelegationTokens';
import SaslAwsIam from './SaslAwsIam';
import UsernamePassword from './UsernamePassword';
import MTLS from './MTLS';

const AuthenticationMethods: React.FC<{ method: string }> = ({ method }) => {
  switch (method) {
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
