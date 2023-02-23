import React from 'react';
import Input from 'components/common/Input/Input';
import {
  FlexRow,
  FlexGrow1,
} from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import Checkbox from 'components/common/Checkbox/Checkbox';
import Fileupload from 'widgets/ClusterConfigForm/Fileupload';

const AuthenticationMethods: React.FC<{ method: string }> = ({ method }) => {
  switch (method) {
    case 'SASL/JAAS':
      return (
        <>
          <Input
            type="text"
            name="auth.props.saslJaasConfig"
            label="sasl.jaas.config"
            withError
          />
          <Input
            type="text"
            name="auth.props.saslMechanism"
            label="sasl.mechanism"
            withError
          />
        </>
      );
    case 'SASL/GSSAPI':
      return (
        <>
          <Input
            label="Kerberos service name"
            type="text"
            name="auth.props.saslKerberosServiceName"
            withError
          />
          <Checkbox name="auth.props.storeKey" label="Store Key" />
          <Fileupload name="auth.props.keyTabFile" label="Key Tab (optional)" />
          <Input
            type="text"
            name="auth.props.principal"
            label="Principal *"
            withError
          />
        </>
      );
    case 'SASL/OAUTHBEARER':
      return (
        <Input
          label="Unsecured Login String Claim_sub *"
          type="text"
          name="auth.props.unsecuredLoginStringClaim_sub"
          withError
        />
      );
    case 'SASL/PLAIN':
    case 'SASL/SCRAM-256':
    case 'SASL/SCRAM-512':
    case 'SASL/LDAP':
      return (
        <FlexRow>
          <FlexGrow1>
            <Input
              label="Username"
              type="text"
              name="auth.props.username"
              withError
            />
          </FlexGrow1>
          <FlexGrow1>
            <Input
              label="Password"
              type="password"
              name="auth.props.password"
              withError
            />
          </FlexGrow1>
        </FlexRow>
      );
    case 'Delegation tokens':
      return (
        <>
          <Input
            label="Token Id"
            type="text"
            name="auth.props.tokenId"
            withError
          />
          <Input
            label="Token Value *"
            type="text"
            name="auth.props.tokenValue"
            withError
          />
        </>
      );
    case 'SASL/AWS IAM':
      return (
        <Input
          label="AWS Profile Name"
          type="text"
          name="auth.props.awsProfileName"
          withError
        />
      );
    case 'mTLS':
    default:
      return null;
  }
};

export default AuthenticationMethods;
