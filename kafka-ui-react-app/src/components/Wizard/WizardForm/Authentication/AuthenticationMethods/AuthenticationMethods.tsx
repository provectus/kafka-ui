import React from 'react';
import Input from 'components/common/Input/Input';

import SaslGssapi from './SaslGssapi';
import MTLS from './MTLS';

const AuthenticationMethods: React.FC<{ method: string }> = ({ method }) => {
  switch (method) {
    case 'SASL/JAAS':
      return (
        <Input
          type="text"
          name="authentication.saslJaasConfig"
          label="sasl.jaas.config"
          withError
        />
      );
    case 'SASL/GSSAPI':
      return <SaslGssapi />;
    case 'SASL/OAUTHBEARER':
      return (
        <Input
          label="Unsecured Login String Claim_sub *"
          type="text"
          name="authentication.unsecuredLoginStringClaim_sub"
          withError
        />
      );
    case 'SASL/PLAIN':
    case 'SASL/SCRAM-256':
    case 'SASL/SCRAM-512':
    case 'SASL/LDAP':
      return (
        <>
          <Input
            label="Username"
            type="text"
            name="authentication.username"
            withError
          />
          <Input
            label="Password"
            type="password"
            name="authentication.password"
            withError
          />
        </>
      );
    case 'Delegation tokens':
      return (
        <>
          <Input
            label="Token Id"
            type="text"
            name="authentication.tokenId"
            withError
          />
          <Input
            label="Token Value *"
            type="text"
            name="authentication.tokenValue"
            withError
          />
        </>
      );
    case 'SASL/AWS IAM':
      return (
        <Input
          label="AWS Profile Name"
          type="text"
          name="authentication.awsProfileName"
          withError
        />
      );
    case 'mTLS':
      return <MTLS />;
    default:
      return null;
  }
};

export default AuthenticationMethods;
