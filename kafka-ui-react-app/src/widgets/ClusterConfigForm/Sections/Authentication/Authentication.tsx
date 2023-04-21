import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AUTH_OPTIONS, SECURITY_PROTOCOL_OPTIONS } from 'lib/constants';
import ControlledSelect from 'components/common/Select/ControlledSelect';
import SectionHeader from 'widgets/ClusterConfigForm/common/SectionHeader';

import AuthenticationMethods from './AuthenticationMethods';

const Authentication: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const hasAuth = !!watch('auth');
  const authMethod = watch('auth.method');
  const hasSecurityProtocolField =
    authMethod && !['Delegation tokens', 'mTLS'].includes(authMethod);

  const toggle = () =>
    setValue('auth', hasAuth ? undefined : {}, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

  return (
    <>
      <SectionHeader
        title="Authentication"
        adding={!hasAuth}
        addButtonText="Configure Authentication"
        onClick={toggle}
      />
      {hasAuth && (
        <>
          <ControlledSelect
            name="auth.method"
            label="Authentication Method"
            placeholder="Select authentication method"
            options={AUTH_OPTIONS}
          />
          {hasSecurityProtocolField && (
            <ControlledSelect
              name="auth.securityProtocol"
              label="Security Protocol"
              placeholder="Select security protocol"
              options={SECURITY_PROTOCOL_OPTIONS}
            />
          )}
          <AuthenticationMethods method={authMethod} />
        </>
      )}
    </>
  );
};

export default Authentication;
