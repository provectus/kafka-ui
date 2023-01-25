import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import SaslJaas from './SaslJaas';
import SaslGssapi from './SaslGssapi';
import SaslOauthbearer from './SaslOauthbearer';
import DelegationTokens from './DelegationTokens';
import SaslAwsIam from './SaslAwsIam';
import UsernamePassword from './UsernamePassword';
import MTLS from './MTLS';

const SaslType = () => {
  const methods = useFormContext();
  const { watch } = methods;
  const saslValues = watch('saslType');

  const Component = useCallback((): JSX.Element | null => {
    switch (saslValues) {
      case 'sasl_jaas':
        return <SaslJaas />;
      case 'sasl_gssapi':
        return <SaslGssapi />;
      case 'sasl_oauthbearer':
        return <SaslOauthbearer />;
      case 'sasl_plain':
      case 'sasl_scram-256':
      case 'sasl_scram-512':
      case 'sasl_ldap':
        return <UsernamePassword />;
      case 'Delegation_token':
        return <DelegationTokens />;
      case 'sasl_aws_iam':
        return <SaslAwsIam />;
      case 'mtls':
        return <MTLS />;
      default:
        return null;
    }
  }, [saslValues]);
  return <Component />;
};

export default SaslType;
