import { isUndefined } from 'lodash';

const JAAS_CONFIGS = {
  'SASL/GSSAPI': 'com.sun.security.auth.module.Krb5LoginModule',
  'SASL/OAUTHBEARER':
    'org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule',
  'SASL/PLAIN': 'org.apache.kafka.common.security.plain.PlainLoginModule',
  'SASL/SCRAM-256': 'org.apache.kafka.common.security.scram.ScramLoginModule',
  'SASL/SCRAM-512': 'org.apache.kafka.common.security.scram.ScramLoginModule',
  'Delegation tokens':
    'org.apache.kafka.common.security.scram.ScramLoginModule',
  'SASL/LDAP': 'org.apache.kafka.common.security.plain.PlainLoginModule',
  'SASL/AWS IAM': 'software.amazon.msk.auth.iam.IAMLoginModule',
};

type MethodName = keyof typeof JAAS_CONFIGS;

export const getJaasConfig = (
  method: MethodName,
  options: Record<string, string>
) => {
  const optionsString = Object.entries(options)
    .map(([key, value]) => {
      if (isUndefined(value)) return null;
      if (value === 'true' || value === 'false') {
        return ` ${key}=${value}`;
      }
      return ` ${key}="${value}"`;
    })
    .join('');

  return `${JAAS_CONFIGS[method]} required${optionsString};`;
};
